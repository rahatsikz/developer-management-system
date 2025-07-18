"use client";
import { dummyTaskList, statusOptions } from "@/data";
import React, { useEffect, useState } from "react";
import Column from "./_components/Column";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  // PointerSensor,
  // TouchSensor,
  // useSensor,
  // useSensors,
  // KeyboardSensor,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { GripIcon } from "lucide-react";
import { CardForm } from "./_components/Card";

const BoardPage = () => {
  const groupedTasks = statusOptions.map((item) => ({
    id: item.value,
    name: item.label,
    tasks: dummyTaskList.filter((task) => task.status === item.value),
  }));

  const [allTasks, setAllTasks] = useState([...groupedTasks]);
  const [activeTask, setActiveTask] = useState<any>(null);
  const handleDragStart = (e: DragStartEvent) => {
    const taskId = e.active.id.toString();
    const draggedTask = allTasks
      .flatMap((col) => col.tasks)
      .find((task) => task.id === taskId);
    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null);

    const { active, over } = e;

    if (!over) return;

    const draggingId = active.id.toString();
    const draggedOn = over.id.toString();

    setAllTasks((prev) => {
      // find in which column dragged card is in currently
      const sourceColumn = prev.find((col) =>
        col.tasks.some((card) => card.id === draggingId)
      );

      // find the target column that user trying to drag the card
      const targetColumn = prev.find(
        (col) =>
          col.id === draggedOn ||
          col.tasks.some((card) => card.id === draggedOn)
      );

      if (!sourceColumn || !targetColumn) return prev;

      // console.log(sourceColumn?.id, targetColumn?.id, draggedOn);

      // sorting code
      if (sourceColumn.id === targetColumn.id) {
        // find index of the dragged card
        const sourceIndex = sourceColumn.tasks.findIndex(
          (task) => task.id === draggingId
        );
        // find index of the dragged over card
        const targetIndex = sourceColumn.tasks.findIndex(
          (task) => task.id === draggedOn
        );

        // updated Tasks Based On Position
        const updatedTasks = arrayMove(
          sourceColumn.tasks,
          sourceIndex,
          targetIndex
        );

        return prev.map((col) =>
          col.id === sourceColumn.id
            ? {
                ...col,
                tasks: updatedTasks,
              }
            : col
        );
      }
      // moving between columns code

      // find the dragged task
      const draggedTask = sourceColumn.tasks.find(
        (task) => task.id === draggingId
      );

      if (!draggedTask) return prev;

      // remove the dragged card from the source column
      const updatedSourceTasks = sourceColumn.tasks.filter(
        (task) => task.id !== draggingId
      );

      // get all task of the targetted column
      const targetTasks = targetColumn.tasks;

      // where dragged task needs to drop in the targetted column
      const targetIndex = targetTasks.findIndex(
        (task) => task.id === draggedOn
      );

      const updatedTargetTasks = [...targetTasks];

      // if it's dragged on top of existing task
      if (targetIndex !== -1) {
        // adding the dragged task on the exact target position/index
        updatedTargetTasks.splice(targetIndex, 0, draggedTask);
      } else {
        // if it's dragged on top of existing task, then adding at the end
        updatedTargetTasks.push(draggedTask);
      }

      return prev.map((col) => {
        // to remove the drag task from source column
        if (col.id === sourceColumn.id) {
          return { ...col, tasks: updatedSourceTasks };
        }
        // to add the task in target column
        if (col.id === targetColumn.id) {
          return { ...col, tasks: updatedTargetTasks };
        }
        return col;
      });
    });
  };

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(TouchSensor, {
  //     activationConstraint: { delay: 200, tolerance: 5 },
  //   }),
  //   useSensor(KeyboardSensor) // optional, for a11y
  // );

  if (!isClient) return;

  return (
    <div>
      <DndContext
        // sensors={sensors}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className='flex gap-4'>
          {allTasks.map((item) => (
            <Column
              key={item.id}
              id={item.id}
              title={item.name}
              tasks={item.tasks}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? <Card task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default BoardPage;

const Card = ({ task }: { task: any }) => {
  return (
    <div className='bg-muted min-h-16 flex flex-col gap-3 p-4 rounded ring-2 ring-primary'>
      <div className='flex items-center gap-3'>
        <GripIcon className='cursor-grabbing size-4' />
        <p className='text-sm font-medium'>{task.name}</p>
      </div>
      <CardForm task={task} />
    </div>
  );
};
