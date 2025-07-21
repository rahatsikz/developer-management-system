"use client";
import React, { useEffect, useState } from "react";
import { SortableContext } from "@dnd-kit/sortable";
import { DndContext } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SortbaleRow } from "./SortableRow";
import AddTaskRow from "./AddTaskRow";
import ListCard, { AddListCard } from "./ListCard";
import { useColumnStore } from "@/store";

export default function ListSection({ taskList }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const columnArr = useColumnStore((state) => state.ColumnArr);

  console.log({ taskList });

  // for hydration error fix on dnd
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!active?.id || !over?.id || active.id === over.id) return;

    const activeItem = taskList.find((item: any) => item.id === active.id);
    const overItem = taskList.find((item: any) => item.id === over.id);

    if (activeItem && overItem) {
      //! Update the taskList state to reflect the new order
      // setTaskList((prev: any) => {
      //   // Find the positions of active and over items in the full task list
      //   const oldIndex = prev.findIndex(
      //     (item: any) => item.id === activeItem.id
      //   );
      //   const newIndex = prev.findIndex((item: any) => item.id === overItem.id);
      //   if (oldIndex === -1 || newIndex === -1) return prev;
      //   // Reorder the full task list
      //   const updatedList = [...prev];
      //   const [movedItem] = updatedList.splice(oldIndex, 1);
      //   updatedList.splice(newIndex, 0, movedItem);
      //   return updatedList;
      // });
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const headers = {
    id: "",
    name: "name",
    assignee: "assignee",
    dueDate: "due date",
    priority: "priority",
    status: "status",
    comments: "comments",
  };

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <SortableContext items={taskList.map((item: any) => item.id)}>
        {/* table */}
        <Table className='hidden lg:table'>
          <TableHeader>
            <TableRow className='group'>
              {columnArr.map((item, idx) => (
                <TableHead
                  key={idx}
                  className={cn(
                    "capitalize",
                    item === "name" ? "sticky left-0 bg-background" : ""
                  )}
                >
                  {headers[item as keyof typeof headers]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskList.map((item: any) => (
              <SortbaleRow key={item.id} data={item} isDragging={isDragging} />
            ))}
            <AddTaskRow />
          </TableBody>
        </Table>
        {/* card */}
        <div className='lg:hidden'>
          <div className='grid md:grid-cols-2 gap-3 mb-4'>
            {taskList.map((item: any) => (
              <ListCard key={item.id} item={item} />
            ))}
          </div>
          <AddListCard />
        </div>
      </SortableContext>
    </DndContext>
  );
}
