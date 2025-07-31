"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useParams, usePathname } from "next/navigation";
import { useGetSpaceById } from "@/api/space.query";
import { MultiSelect, OptionProps } from "@/components/ui/MultiSelect";
import { ComboBox } from "@/components/ui/ComboBox";
import { DatePicker } from "@/components/ui/DatePicker";
import { priorityOptions } from "@/data";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { useCreateTask } from "@/api/task.query";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  //   assignees: z.array(z.string()).min(1, "Assignees are required"),
  priority: z.string().min(1, "Priority is required"),
  dueDate: z.string().min(1, "Due date is required"),
  assignees: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
      id: z.string(),
      acronym: z.string().optional(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

export function AddTaskDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      assignees: [],
      priority: "",
      dueDate: "",
    },
  });

  const { mutate: createTask, isPending } = useCreateTask();
  const { spaceId } = useParams();

  const { data } = useGetSpaceById(spaceId as string);

  async function onSubmit(values: FormValues) {
    try {
      const data = {
        title: values.title,
        assigneeIds:
          values.assignees.map((assignee: OptionProps) => assignee.value) ?? [],
        priority: values.priority.toUpperCase(),
        dueDate: values.dueDate,
        spaceId: spaceId as string,
      };

      console.log("Task Data:", data);

      createTask(data, {
        onSuccess: () => {
          toast.success("Task added successfully");
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          form.reset();
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to create task");
        },
      });
    } catch (error) {
      console.error("Failed to create task", error);
    }
  }

  const isTabDevice = useMediaQuery("(min-width: 768px)");
  const isLargeDevice = useMediaQuery("(min-width: 1440px)");

  const pathname = usePathname();
  const isBoardRoute = pathname.includes("board");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isTabDevice ? (
          <Button
            size={isLargeDevice ? (isBoardRoute ? "default" : "default") : "sm"}
            className={cn(
              isLargeDevice ? "" : "rounded-full",
              "text-[13px]",
              isBoardRoute && "rounded-full gap-1.5 px-4 h-[34px]"
            )}
          >
            <Plus className='size-3.5!' />
            <span>Add Task</span>
          </Button>
        ) : (
          <Button size={"icon"} className='size-8'>
            <Plus className='size-4!' />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Enter the details for the new task
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <div className='flex items-center justify-between w-full gap-10'>
              <p className='pl-1 min-w-16 text-sm'>Title</p>
              <Input
                formControl={form.control}
                name='title'
                className='border border-input w-full'
              />
            </div>
            <div className='flex items-center justify-between w-full gap-10'>
              <p className='pl-1 min-w-16 text-sm'>Assginee</p>
              <MultiSelect
                formControl={form.control}
                name='assignees'
                options={getUserOptions(data?.members || [])}
                className='border border-input w-full pl-3 h-10'
              />
            </div>
            <div className='flex items-center justify-between w-full gap-10'>
              <p className='pl-1 min-w-16 text-sm'>Priority</p>
              <ComboBox
                formControl={form.control}
                name='priority'
                options={priorityOptions}
                className='border border-input w-full'
              />
            </div>
            <div></div>
            <div className='flex items-center justify-between w-full gap-10'>
              <p className='pl-1 min-w-16 text-sm'>Due Date</p>
              <DatePicker
                formController={form.control}
                name='dueDate'
                className='border border-input w-full'
              />
            </div>
            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                {isPending ? "Adding..." : "Add Task"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function getUserOptions(spaceUsers: User[]): OptionProps[] {
  const usedAcronyms = new Set<string>();
  const makeUnique = (base: string) => {
    let acronym = base;
    let i = 2;
    // If there's a clash, extend by one more character:
    while (usedAcronyms.has(acronym)) {
      acronym = base.slice(0, ++i).toUpperCase();
    }
    usedAcronyms.add(acronym);
    return acronym;
  };

  return spaceUsers.map((user) => {
    // Preferred source for acronym: name if available, else email
    const source = user.name?.trim() || user.email;
    // Take first 2 letters (uppercased)
    const raw = source.replace(/\s+/g, "").slice(0, 2).toUpperCase();
    const acronym = makeUnique(raw);

    return {
      value: user.id,
      label: user.name?.trim() || user.email,
      id: user.id,
      acronym,
    };
  });
}
