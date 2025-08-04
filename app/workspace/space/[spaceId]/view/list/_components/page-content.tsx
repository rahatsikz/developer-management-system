"use client";
import React, { useEffect, useState } from "react";
import { priorityOptions, statusOptions } from "@/data";
import FilterBar from "./FilterBar";
import { cn } from "@/lib/utils";
import ListSection from "./ListSection";
import { useParams } from "next/navigation";
import { useGetTasksBySpaceId } from "@/api/task.query";
import { useDelayedSpinner } from "@/hooks/use-delayed-spinner";
import { Task, User } from "@/types";
import { useAuthStore } from "@/store/use-auth-store";
import { useGetSpaceById } from "@/api/space.query";

type GroupKey = "status" | "priority" | "assignee";

export default function ListPage() {
  const { spaceId } = useParams();

  const {
    data: tasks,
    isFetching,
    isLoading,
  } = useGetTasksBySpaceId(spaceId as string);
  const { data: space } = useGetSpaceById(spaceId as string);
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);

  const showSpinner = useDelayedSpinner(isFetching, !!tasks);

  const [group, setGroup] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("group") ?? "status";
    }
    return "status";
  });
  const [meMode, setMeMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("meMode");
      return stored === "true";
    }
    return false;
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("meMode");
    if (stored !== null) setMeMode(stored === "true");
  }, []);

  useEffect(() => {
    sessionStorage.setItem("meMode", String(meMode));
  }, [meMode]);

  const { user } = useAuthStore((state) => state);

  if (showSpinner || isLoading) {
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
        className='lg:-ml-0.5'
      />
      <div className='space-y-7 mt-4'>
        {groupedTasks({
          tasks: meMode ? myTasks : tasks,
          group,
          allUsers: space?.members,
        })?.map(
          ({
            key,
            label,
            tasks,
          }: {
            key: string;
            label: string;
            tasks: Task[];
          }) => (
            <div key={key}>
              <h1
                className={cn(
                  "max-lg:ml-2 capitalize font-medium",
                  tasks.length ? "mb-3" : ""
                )}
              >
                {label.split("_").join(" ").toLowerCase()}
              </h1>
              <ListSection
                taskList={tasks}
                groupBy={key}
                isAddingTask={isAddingTask}
                setIsAddingTask={setIsAddingTask}
              />
            </div>
          )
        )}
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

interface Bucket {
  key: string;
  label: string;
  tasks: Task[];
}

export function groupedTasks({
  tasks,
  group,
  allUsers = [], // Add this optional param
}: {
  tasks: Task[] | undefined;
  group: string;
  allUsers?: User[];
}): Bucket[] {
  if (group === "none") {
    return [
      {
        key: "all",
        label: "All Tasks",
        tasks: tasks ?? [],
      },
    ];
  }

  if (group === "status") {
    return groupBy(
      tasks ?? [],
      "status",
      statusOptions.map((o) => o.value)
    );
  }

  if (group === "priority") {
    return groupBy(
      tasks ?? [],
      "priority",
      priorityOptions.map((o) => o.value)
    );
  }

  if (group === "assignee") {
    const buckets = groupBy(tasks ?? [], "assignee");

    // Add unassigned bucket if missing
    if (!buckets.some((b) => b.key === "unassigned")) {
      buckets.push({
        key: "unassigned",
        label: "Unassigned",
        tasks: [],
      });
    }

    allUsers.forEach((user) => {
      if (!buckets.some((b) => b.key === user.id)) {
        buckets.push({
          key: user.id,
          label: user.name,
          tasks: [],
        });
      }
    });

    return [
      ...(allUsers
        .map((user) => buckets.find((b) => b.key === user.id))
        .filter(Boolean) as Bucket[]),
      buckets.find((b) => b.key === "unassigned")!,
    ];
  }

  return [];
}

export function groupBy(
  tasks: Task[],
  groupBy: Exclude<GroupKey, "none">,
  possibleKeys: string[] = []
): Bucket[] {
  const buckets: Record<string, Bucket> = {};

  if (groupBy !== "assignee") {
    for (const key of possibleKeys) {
      buckets[key] = { key, label: key, tasks: [] };
    }
  }

  for (const t of tasks) {
    if (groupBy === "assignee") {
      if (!t.assignees?.length) {
        buckets["unassigned"] ??= {
          key: "unassigned",
          label: "Unassigned",
          tasks: [],
        };
        buckets["unassigned"].tasks.push(t);
      } else {
        for (const u of t.assignees) {
          buckets[u.id] ??= { key: u.id, label: u.name, tasks: [] };
          buckets[u.id].tasks.push(t);
        }
      }
    } else {
      const val = (t as any)[groupBy] ?? "unknown";
      buckets[val] ??= { key: val, label: val, tasks: [] };
      buckets[val].tasks.push(t);
    }
  }

  return Object.values(buckets);
}
