"use client";
import React, { useState } from "react";
import { statusOptions } from "@/data";
import FilterBar from "./FilterBar";
import { cn } from "@/lib/utils";
import ListSection from "./ListSection";
import { useParams } from "next/navigation";
import { useGetTasksBySpaceId } from "@/api/task.query";
import { useDelayedSpinner } from "@/hooks/use-delayed-spinner";

export default function ListPage() {
  const { spaceId } = useParams();

  const { data: tasks, isFetching } = useGetTasksBySpaceId(spaceId as string);
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);

  const groupedTaskList =
    (tasks &&
      tasks.reduce((acc: any, task: any) => {
        const status = task.status;
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(task);
        return acc;
      }, {})) ||
    {};

  const showSpinner = useDelayedSpinner(isFetching, !!tasks);

  if (showSpinner) {
    return <TableSkeleton />;
  }

  return (
    <section>
      <FilterBar />
      {/* <ListSection taskList={taskList} setTaskList={setTaskList} /> */}
      <div className='space-y-7 mt-4 lg:mt-8'>
        {statusOptions.map((task) => {
          const list = groupedTaskList[task.value] || [];
          return (
            <div key={task.value}>
              <h1 className={cn("max-lg:ml-2", list.length ? "mb-3" : "")}>
                {task.label}
              </h1>
              <ListSection
                taskList={list}
                groupBy={task.value}
                isAddingTask={isAddingTask}
                setIsAddingTask={setIsAddingTask}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TableSkeleton() {
  return (
    <table className='w-full table-auto border-collapse'>
      <thead>
        <tr className='bg-muted/20'>
          <th className='p-2 text-left text-xs font-medium text-muted-foreground'>
            Drag
          </th>
          <th className='p-2 text-left text-xs font-medium text-muted-foreground'>
            Title
          </th>
          <th className='p-2 text-left text-xs font-medium text-muted-foreground'>
            Assignee
          </th>
          <th className='p-2 text-left text-xs font-medium text-muted-foreground'>
            Due Date
          </th>
          <th className='p-2 text-left text-xs font-medium text-muted-foreground'>
            Priority
          </th>
          <th className='p-2 text-left text-xs font-medium text-muted-foreground'>
            Status
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, idx) => (
          <tr
            key={idx}
            className='border-b transition-colors group animate-pulse'
          >
            {/* Grip Icon Cell */}
            <td className='p-2 min-w-12 w-12'>
              <div className='w-4 h-4 bg-muted/40 rounded' />
            </td>

            {/* Title & Button Cell */}
            <td className='p-2 min-w-72 flex items-center gap-2 w-full sticky left-0 bg-background'>
              <div className='h-8 w-8 bg-muted/40 rounded-md' />
              <div className='flex flex-col gap-1 w-full'>
                <div className='w-3/4 h-4 bg-muted/40 rounded' />
              </div>
            </td>

            {/* Assignee */}
            <td className='p-2 min-w-44'>
              <div className='w-7 h-7 rounded-full bg-muted/40' />
            </td>

            {/* Due Date */}
            <td className='p-2 min-w-44'>
              <div className='h-4 w-24 bg-muted/40 rounded' />
            </td>

            {/* Priority */}
            <td className='p-2 min-w-44'>
              <div className='h-4 w-16 bg-muted/40 rounded' />
            </td>

            {/* Status */}
            <td className='p-2 min-w-44'>
              <div className='h-4 w-20 bg-muted/40 rounded' />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
