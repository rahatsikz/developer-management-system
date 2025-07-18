"use client";
import React, { useState } from "react";
import ListSection from "./_components/ListSection";
import { dummyTaskList, statusOptions } from "@/data";
import FilterBar from "./_components/FilterBar";
import { cn } from "@/lib/utils";

export default function ProjectPage() {
  // { params }: { params: { id: string } }
  const [taskList, setTaskList] = useState(dummyTaskList);

  const groupedTaskList = taskList.reduce((acc: any, task: any) => {
    const status = task.status;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(task);
    return acc;
  }, {});

  console.log(groupedTaskList["todo"], "todo");

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
                <ListSection
                  taskList={groupedTaskList[task.value]}
                  setTaskList={setTaskList}
                />
              ) : (
                <ListSection taskList={[]} setTaskList={setTaskList} />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
