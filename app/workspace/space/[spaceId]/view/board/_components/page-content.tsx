"use client";
import React, { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { GripIcon } from "lucide-react";
import Column from "./Column";
import { CardForm } from "./Card";
import { useParams } from "next/navigation";
import {
  useGetTasksBySpaceId,
  useTaskReorder,
  useUpdateTaskStatus,
} from "@/api/task.query";
import { groupedTasks } from "../../list/_components/page-content";
import { Task, TaskStatus } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

export default function BoardPageContent() {
  const { spaceId } = useParams();

  const { data: tasks } = useGetTasksBySpaceId(spaceId as string);
  const [activeTask, setActiveTask] = useState<any>(null);

  const handleDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    const task = tasks?.find((t) => String(t.id) === id) ?? null;
    setActiveTask(task);
  };

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { mutate } = useTaskReorder();
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();
  const queryClient = useQueryClient();

  const [localTasks, setLocalTasks] = React.useState<Task[]>([]);

  // Init localTasks from server data once
  React.useEffect(() => {
    if (tasks) setLocalTasks(tasks);
  }, [tasks]);

  const taskById = React.useMemo(() => {
    return new Map(localTasks.map((t) => [t.id, t]));
  }, [localTasks]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!active?.id || !over?.id || active.id === over.id) return;

    const draggingId = String(active.id);
    const overId = String(over.id);

    const draggedTask = taskById.get(draggingId);
    if (!draggedTask) return;

    const overIsTask = taskById.has(overId);
    const targetStatus = overIsTask ? taskById.get(overId)!.status : overId;
    if (!targetStatus) return;

    const sourceStatus = draggedTask.status as TaskStatus;

    const mutatedOrders: { [status: string]: string[] } = {};

    setLocalTasks((prev) => {
      let newTasks = [...prev];

      if (sourceStatus === targetStatus) {
        const tasksInColumn = newTasks.filter((t) => t.status === sourceStatus);
        const oldIndex = tasksInColumn.findIndex((t) => t.id === draggingId);
        const newIndex = overIsTask
          ? tasksInColumn.findIndex((t) => t.id === overId)
          : tasksInColumn.length - 1;

        if (oldIndex === -1 || newIndex === -1) return prev;

        const reordered = arrayMove(tasksInColumn, oldIndex, newIndex);

        reordered.forEach((t, i) => (t.order = i));

        newTasks = [
          ...newTasks.filter((t) => t.status !== sourceStatus),
          ...reordered,
        ];

        mutatedOrders[sourceStatus] = reordered.map((t) => t.id);
      } else {
        // Cross-column move
        const sourceTasks = newTasks.filter((t) => t.status === sourceStatus);
        const targetTasks = newTasks.filter((t) => t.status === targetStatus);

        const sourceIndex = sourceTasks.findIndex((t) => t.id === draggingId);
        if (sourceIndex === -1) return prev;

        sourceTasks.splice(sourceIndex, 1);

        const targetIndex = overIsTask
          ? targetTasks.findIndex((t) => t.id === overId)
          : targetTasks.length;

        draggedTask.status = targetStatus as TaskStatus;

        targetTasks.splice(targetIndex, 0, draggedTask);

        sourceTasks.forEach((t, i) => (t.order = i));
        targetTasks.forEach((t, i) => (t.order = i));

        newTasks = [
          ...newTasks.filter(
            (t) => t.status !== sourceStatus && t.status !== targetStatus
          ),
          ...sourceTasks,
          ...targetTasks,
        ];

        mutatedOrders[sourceStatus] = sourceTasks.map((t) => t.id);
        mutatedOrders[targetStatus] = targetTasks.map((t) => t.id);
      }

      return newTasks;
    });

    // Now, call backend mutations based on mutatedOrders (local updated order)

    if (sourceStatus === targetStatus) {
      // same column reorder
      mutate(
        { taskIds: mutatedOrders[sourceStatus], spaceId: spaceId as string },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", spaceId] });
          },
          onError: () => {
            setLocalTasks(tasks as Task[]);
          },
        }
      );
    } else {
      // cross-column move
      updateTaskStatus(
        { taskId: draggingId, status: targetStatus },
        {
          onSuccess: () => {
            mutate(
              {
                taskIds: mutatedOrders[sourceStatus],
                spaceId: spaceId as string,
              },
              {
                onSuccess: () => {
                  mutate(
                    {
                      taskIds: mutatedOrders[targetStatus],
                      spaceId: spaceId as string,
                    },
                    {
                      onSuccess: () => {
                        queryClient.invalidateQueries({
                          queryKey: ["tasks", spaceId],
                        });
                      },
                      onError: () => setLocalTasks(tasks as Task[]),
                    }
                  );
                },
                onError: () => setLocalTasks(tasks as Task[]),
              }
            );
          },
          onError: () => setLocalTasks(tasks as Task[]),
        }
      );
    }
  };

  if (!isClient) return;

  return (
    <div>
      <DndContext
        // sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className='flex gap-4'>
          {Object.entries(
            groupedTasks({
              tasks: localTasks,
              group: "status",
            })
          ).map(([key, list], index) => (
            <Column key={index} id={key} title={key} tasks={list} />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <Card task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

const Card = ({ task }: { task: Task }) => {
  return (
    <div className='bg-muted min-h-16 flex flex-col gap-3 p-4 rounded ring-2 ring-primary'>
      <div className='flex items-center gap-3'>
        <GripIcon className='cursor-grabbing size-4' />
        <p className='text-sm font-medium'>{task.title}</p>
      </div>
      <CardForm task={task} />
    </div>
  );
};
