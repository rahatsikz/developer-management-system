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
import { Task } from "@/types";
import { useTaskReorder } from "@/api/task.query";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function ListSection({ taskList }: { taskList: Task[] }) {
  const [isDragging, setIsDragging] = useState(false);
  const columnArr = useColumnStore((state) => state.ColumnArr);

  // console.log({ taskList });

  // const [tasks, setTasks] = useState<Task[]>(taskList || []);

  // for hydration error fix on dnd
  const [isClient, setIsClient] = useState(false);
  const initialOrder = taskList.map((t) => t.id);
  const [taskOrder, setTaskOrder] = React.useState<string[]>(initialOrder);

  useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    const newOrder = taskList.map((t) => t.id);

    const isDifferent = newOrder.length !== taskOrder.length;

    if (isDifferent) {
      setTaskOrder(newOrder);
    }
  }, [taskList, taskOrder]);

  // Get ordered tasks for rendering
  const orderedTasks = taskOrder
    .map((id) => taskList.find((task) => task.id === id))
    .filter(Boolean) as Task[]; // filter out undefined if any

  console.log(orderedTasks, "orderedTasks");

  // const handleDragEnd = (event: any) => {
  //   const { active, over } = event;
  //   setIsDragging(false);

  //   if (!active?.id || !over?.id || active.id === over.id) return;

  //   const activeItem = taskList.find((item: any) => item.id === active.id);
  //   const overItem = taskList.find((item: any) => item.id === over.id);

  //   if (activeItem && overItem) {
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
  //   }
  // };

  const { mutate } = useTaskReorder();
  const { spaceId } = useParams();
  const queryClient = useQueryClient();
  const handleDragEnd = (event: any) => {
    setIsDragging(false);
    const { active, over } = event;

    if (!active?.id || !over?.id || active.id === over.id) return;

    const oldIndex = taskOrder.indexOf(active.id);
    const newIndex = taskOrder.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = [...taskOrder];
    const [movedId] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, movedId);
    setTaskOrder(newOrder);

    // Call backend mutation to update order by IDs
    mutate(
      { taskIds: newOrder, spaceId: spaceId as string },
      {
        onSuccess: () => {
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
          }, 800);
          console.log("Task order updated successfully");
        },
      }
    );
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

  if (!isClient) return null;

  return (
    <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <SortableContext items={taskOrder}>
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
            {orderedTasks.map((item: Task) => (
              <SortbaleRow key={item.id} data={item} isDragging={isDragging} />
            ))}
            <AddTaskRow />
          </TableBody>
        </Table>
        {/* card */}
        <div className='lg:hidden'>
          <div className='grid md:grid-cols-2 gap-3 mb-4'>
            {orderedTasks.map((item: any) => (
              <ListCard key={item.id} item={item} />
            ))}
          </div>
          <AddListCard />
        </div>
      </SortableContext>
    </DndContext>
  );
}
