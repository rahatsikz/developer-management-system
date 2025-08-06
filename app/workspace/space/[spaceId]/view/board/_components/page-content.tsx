"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import { GripIcon } from "lucide-react";
import Column from "./Column";
import { CardForm } from "./Card";
import { useParams } from "next/navigation";
import {
  useGetTasksBySpaceId,
  useTaskReorder,
  useUpdateTask,
} from "@/api/task.query";
import { groupedTasks } from "../../list/_components/page-content";
import { Task, User } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/use-auth-store";
import FilterBar from "../../list/_components/FilterBar";
import { useGetSpaceById } from "@/api/space.query";

export default function BoardPageContent() {
  const { spaceId } = useParams();
  const { data: tasks } = useGetTasksBySpaceId(spaceId as string);
  const { data: space } = useGetSpaceById(spaceId as string);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { mutate } = useTaskReorder();
  const { mutate: updateTask } = useUpdateTask(activeTask?.id ?? "");
  const queryClient = useQueryClient();
  const [group, setGroup] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("group") ?? "status";
    }
    return "status";
  });
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const { user } = useAuthStore((state) => state);
  const [meMode, setMeMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("meMode") === "true";
    }
    return false;
  });

  useEffect(() => {
    setIsClient(true);
    const stored = sessionStorage.getItem("meMode");
    if (stored !== null) setMeMode(stored === "true");
  }, []);

  useEffect(() => {
    sessionStorage.setItem("meMode", String(meMode));
  }, [meMode]);

  useEffect(() => {
    if (tasks) setLocalTasks(tasks);
  }, [tasks]);

  const taskById = React.useMemo(() => {
    return new Map(localTasks.map((t) => [t.id, t]));
  }, [localTasks]);

  const handleDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    const task = taskById.get(id) ?? null;
    setActiveTask(task);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!active?.id || !over?.id || active.id === over.id) return;

    const draggingId = String(active.id);
    const overId = String(over.id);
    const dragged = taskById.get(draggingId);
    if (!dragged) return;

    // helper
    const sourceValue = getGroupValue(dragged, group);
    const targetTask = taskById.get(overId);
    const targetValue =
      overId && targetTask ? getGroupValue(targetTask, group) : overId;

    if (!sourceValue || !targetValue) return;

    //keep track of updated orders per group to sync backend
    const mutatedOrders: Record<string, string[]> = {};

    setLocalTasks((prev) => {
      if (sourceValue === targetValue) {
        // Reordering within the same group
        const groupTasks = prev.filter(
          (t) => getGroupValue(t, group) === sourceValue
        );
        const reordered = reorderWithinGroup(groupTasks, draggingId, overId);

        reordered.forEach((t, i) => (t.order = i));
        mutatedOrders[sourceValue] = reordered.map((t) => t.id);

        // Replace old group tasks with reordered ones, keep others intact
        const others = prev.filter(
          (t) => getGroupValue(t, group) !== sourceValue
        );
        return [...others, ...reordered];
      } else {
        // Moving between groups
        const updated = moveBetweenGroups(
          prev,
          dragged,
          overId,
          group,
          targetValue,
          space?.members
        );

        // Update order in both affected groups
        const sourceGroupTasks = updated.filter(
          (t) => getGroupValue(t, group) === sourceValue
        );
        const targetGroupTasks = updated.filter(
          (t) => getGroupValue(t, group) === targetValue
        );

        sourceGroupTasks.forEach((t, i) => (t.order = i));
        targetGroupTasks.forEach((t, i) => (t.order = i));

        mutatedOrders[sourceValue] = sourceGroupTasks.map((t) => t.id);
        mutatedOrders[targetValue] = targetGroupTasks.map((t) => t.id);

        return updated;
      }
    });

    // Build payload with your helper
    const payload = buildUpdatePayload(group, targetValue);

    // Call updateTask with payload
    updateTask(
      { ...(payload as any) },
      {
        onSuccess: () => {
          const updateBucket = (val: string) =>
            mutate(
              { taskIds: mutatedOrders[val], spaceId: spaceId as string },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: ["tasks", spaceId],
                  });
                },
                onError: () => setLocalTasks(tasks ?? []),
              }
            );

          if (sourceValue === targetValue) {
            updateBucket(sourceValue);
          } else {
            updateBucket(sourceValue);
            updateBucket(targetValue);
          }
        },
        onError: () => setLocalTasks(tasks ?? []),
      }
    );
  };

  const grouped = useMemo(() => {
    const myTasks = user
      ? tasks?.filter((t) => t.assignees.some((u) => u.id === user.id))
      : [];

    return groupedTasks({
      tasks: meMode ? myTasks : localTasks,
      group,
      allUsers: space?.members,
    });
  }, [meMode, localTasks, group, space?.members, tasks, user]);

  if (!isClient) return null;

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-4'>
        <FilterBar
          meMode={meMode}
          setMeMode={setMeMode}
          groupChangeHandler={setGroup}
        />
      </div>
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className='flex gap-4'>
          {grouped.map(({ key, label, tasks }) => (
            <Column key={key} id={key} title={label} tasks={tasks} />
          ))}
        </div>
        <DragOverlay>{activeTask && <Card task={activeTask} />}</DragOverlay>
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

// Helper: Get group key of a task
function getGroupValue(task: Task, groupBy: string): string {
  if (groupBy === "assignee") {
    return task.assignees?.[0]?.id ?? "unassigned";
  }
  return (task as any)[groupBy] ?? "unknown";
}

// Helper: Reorder within same group
function reorderWithinGroup(tasks: Task[], fromId: string, toId: string) {
  const updated = [...tasks];
  const fromIndex = updated.findIndex((t) => t.id === fromId);
  const toIndex = updated.findIndex((t) => t.id === toId);
  if (fromIndex === -1 || toIndex === -1) return tasks;
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(toIndex, 0, moved);
  return updated;
}

// Helper: Move between different groups
function moveBetweenGroups(
  tasks: Task[],
  dragged: Task,
  toId: string,
  groupBy: string,
  newGroupKey: string,
  allUsers?: User[]
) {
  const filtered = tasks.filter((t) => t.id !== dragged.id);
  const index = filtered.findIndex((t) => t.id === toId);

  const member = allUsers?.find((u) => u.id === newGroupKey);
  const updatedTask =
    groupBy === "assignee"
      ? {
          ...dragged,
          assignees: newGroupKey === "unassigned" ? [] : [member],
        }
      : {
          ...dragged,
          [groupBy]: newGroupKey === "unknown" ? null : newGroupKey,
        };

  filtered.splice(
    index === -1 ? filtered.length : index,
    0,
    updatedTask as any
  );
  return filtered;
}

// Helper: Build backend payload
function buildUpdatePayload(
  groupBy: string,
  newGroupKey: string
): {
  assigneeIds?: string[];
  status?: string | null;
  priority?: string | null;
} {
  if (groupBy === "assignee") {
    return {
      assigneeIds: newGroupKey === "unassigned" ? [] : [newGroupKey],
    };
  }
  return {
    [groupBy]: newGroupKey === "unknown" ? null : newGroupKey,
  };
}
