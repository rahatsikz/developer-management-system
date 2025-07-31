import React from "react";
import Card from "./Card";
import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Task } from "@/types";

const Column = ({
  id,
  title,
  tasks,
}: {
  id: string;
  title: string;
  tasks: Task[] | undefined;
}) => {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className='border-2 border-muted-foreground/70 min-h-96 min-w-[290px] xl:min-w-96 py-3 px-4 rounded'
    >
      <h1 className='capitalize font-medium'>
        {title.toLowerCase().split("_").join(" ")}
      </h1>
      <SortableContext
        items={tasks ? tasks.map((task) => task.id) : []}
        strategy={rectSortingStrategy}
      >
        <div className='space-y-4 mt-3'>
          {tasks?.map((task) => (
            <Card key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

export default Column;
