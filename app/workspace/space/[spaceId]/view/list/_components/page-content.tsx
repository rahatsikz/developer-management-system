"use client";
import React from "react";
import { statusOptions } from "@/data";
import FilterBar from "./FilterBar";
import { cn } from "@/lib/utils";
import ListSection from "./ListSection";
import { useParams } from "next/navigation";
import { useGetTasksBySpaceId } from "@/api/task.query";

export default function ListPage() {
  const { spaceId } = useParams();

  const { data: tasks, isLoading } = useGetTasksBySpaceId(spaceId as string);

  console.log(tasks, "tasks");

  const groupedTaskList =
    tasks &&
    tasks.reduce((acc: any, task: any) => {
      const status = task.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log(groupedTaskList["TODO"], "todo");

  return (
    <section>
      <FilterBar />
      {/* <ListSection taskList={taskList} setTaskList={setTaskList} /> */}
      <div className='space-y-7 mt-4 lg:mt-8'>
        {statusOptions.map((task) => {
          return (
            <div key={task.value}>
              <h1
                className={cn(
                  "max-lg:ml-2",
                  groupedTaskList[task.value] ? "mb-3" : ""
                )}
              >
                {task.label}
              </h1>
              {groupedTaskList[task.value] ? (
                <ListSection taskList={groupedTaskList[task.value]} />
              ) : (
                <ListSection taskList={[]} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
