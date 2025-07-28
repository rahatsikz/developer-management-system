"use client";
import React, { useState } from "react";
import { priorityOptions, statusOptions } from "@/data";
import FilterBar from "./FilterBar";
import { cn } from "@/lib/utils";
import ListSection from "./ListSection";
import { useParams } from "next/navigation";
import { useGetTasksBySpaceId } from "@/api/task.query";
import { useDelayedSpinner } from "@/hooks/use-delayed-spinner";
import { Task } from "@/types";
import { useAuthStore } from "@/store/use-auth-store";

type GroupKey = "status" | "priority" | "assignee";

export default function ListPage() {
  const { spaceId } = useParams();

  const { data: tasks, isFetching } = useGetTasksBySpaceId(spaceId as string);
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);

  const showSpinner = useDelayedSpinner(isFetching, !!tasks);

  const [group, setGroup] = useState<string>("status");
  const [meMode, setMeMode] = useState(false);

  const { user } = useAuthStore((state) => state);

  if (showSpinner) {
    return <TableSkeleton />;
  }

  const myTasks = user
    ? tasks?.filter((task) => task.assignees.some((u) => u.id === user.id))
    : [];

  return (
    <section>
      <FilterBar
        groupChangeHandler={setGroup}
        meMode={meMode}
        setMeMode={setMeMode}
      />
      <div className='space-y-7 mt-4 lg:mt-8'>
        {Object.entries(
          groupedTasks({
            tasks: meMode ? myTasks : tasks,
            group,
          })
        ).map(([key, list]) => (
          <div key={key}>
            <h1
              className={cn(
                "max-lg:ml-2 capitalize",
                list.length ? "mb-3" : ""
              )}
            >
              {key === "unassigned"
                ? "Unassigned"
                : key.toLowerCase().split("_").join(" ")}
            </h1>
            <ListSection
              taskList={list}
              groupBy={key}
              isAddingTask={isAddingTask}
              setIsAddingTask={setIsAddingTask}
            />
          </div>
        ))}
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

function groupedTasks({
  tasks,
  group,
}: {
  tasks: Task[] | undefined;
  group: string;
}) {
  const groupedByStatus = groupBy(
    tasks ? tasks : [],
    "status",
    statusOptions.map((item) => item.value)
  );
  const groupedByPriority = groupBy(
    tasks ? tasks : [],
    "priority",
    priorityOptions.map((item) => item.value)
  );
  const groupedByAssignee = groupBy(tasks ? tasks : [], "assignee");

  let groupedTasks;

  switch (group) {
    case "status":
      groupedTasks = groupedByStatus;
      break;
    case "priority":
      groupedTasks = groupedByPriority;
      break;
    case "assignee":
      groupedTasks = groupedByAssignee;
      break;
    case "none":
      groupedTasks = { all: tasks ?? [] };
      break;

    default:
      groupedTasks = {};
  }

  return groupedTasks;
}

function groupBy(
  tasks: Task[],
  groupBy: GroupKey,
  possibleKeys: string[] = []
): Record<string, Task[]> {
  const grouped: Record<string, Task[]> = {};

  if (groupBy !== "assignee") {
    for (const key of possibleKeys) {
      grouped[key] = [];
    }
  }

  for (const task of tasks) {
    if (groupBy === "assignee") {
      if (!task.assignees || task.assignees.length === 0) {
        // No assignees
        grouped["unassigned"] ??= [];
        grouped["unassigned"].push(task);
      } else {
        for (const user of task.assignees) {
          const key = user.name || user.email || "unknown"; // Pick your identifier
          grouped[key] ??= [];
          grouped[key].push(task);
        }
      }
    } else {
      const key = task[groupBy] ?? "unknown";
      grouped[key] ??= [];
      grouped[key].push(task);
    }
  }

  return grouped;
}
