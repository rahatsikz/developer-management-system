import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ComboBox } from "@/components/ui/ComboBox";
import { DatePicker } from "@/components/ui/DatePicker";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { priorityOptions, statusOptions } from "@/data";
import { getUserAcronym } from "@/lib/acronym";
import { cn } from "@/lib/utils";
import { Task } from "@/types";
import { Check, CircleDashed, Edit, Flag, Plus, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { getUserOptions } from "../../_components/add-task-dialog";
import { useParams } from "next/navigation";
import { useGetSpaceById } from "@/api/space.query";
import { useMutateField } from "./SortableRow";
import { useUpdateTask } from "@/api/task.query";
import { useQueryClient } from "@tanstack/react-query";

export default function ListCard({ item }: { item: Task }) {
  const form = useForm({
    defaultValues: {
      title: item.title,
      assignees: item.assignees.map((assignee: any) => ({
        value: assignee.id,
        label: assignee.name,
        id: assignee.id,
        acronym: getUserAcronym(assignee),
      })),
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate,
    },
  });

  React.useEffect(() => {
    form.reset({
      title: item.title,
      assignees: item.assignees.map((assignee: any) => ({
        value: assignee.id,
        label: assignee.name,
        id: assignee.id,
        acronym: getUserAcronym(assignee),
      })),
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate,
    });
  }, [item, form]);

  const [isNameEditing, setIsNameEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNameEditing && inputRef.current) {
      inputRef.current.focus();
    }

    // Handle clicks outside the container
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsNameEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNameEditing, item.id]);

  const { mutate } = useUpdateTask(item.id);
  const queryClient = useQueryClient();

  const mutateField = useMutateField(mutate, form, queryClient);

  return (
    <Card className='w-full'>
      <Form {...form}>
        <CardHeader className='group ml-1 sm:max-lg:p-4 '>
          <CardDescription>Name</CardDescription>

          <div
            className=' flex items-center w-full justify-between cursor-pointer'
            ref={containerRef}
          >
            <div
              className={cn(
                isNameEditing ? "hidden" : "flex gap-4 items-center w-full"
              )}
            >
              <CardTitle>{item.title}</CardTitle>
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => setIsNameEditing(true)}
                className={cn(
                  "opacity-0  transition-opacity",
                  "group-hover:opacity-100 size-4"
                )}
              >
                <Edit />
              </Button>
            </div>
            <form
              onSubmit={form.handleSubmit(() => {
                // console.log(form.getValues().name);
                mutateField("title");
                setIsNameEditing(false);
              })}
              className={cn(
                isNameEditing
                  ? "flex justify-between items-center gap-4 w-full"
                  : "hidden"
              )}
            >
              <Input
                name='title'
                formControl={form.control}
                ref={inputRef}
                type='text'
                className='border-0 shadow-none px-0 py-0 h-4 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-40'
              />
              <Button
                size={"icon"}
                variant={"ghost"}
                type='submit'
                className='size-4'
              >
                <Check
                  style={{ strokeWidth: "4px" }}
                  className='text-primary'
                />
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent className='sm:max-lg:p-4 sm:max-lg:pt-0'>
          <AddTaskForm form={form} mutateField={mutateField} />
        </CardContent>
      </Form>
    </Card>
  );
}

export function AddListCard() {
  const form = useForm({
    defaultValues: {
      name: "",
      assignee: null,
      status: null,
      priority: null,
      dueDate: null,
    },
  });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingTask && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingTask]);

  return (
    <Card className='w-full'>
      <CardContent className={cn("p-0", isAddingTask && "hidden")}>
        <Button
          variant={"ghost"}
          size={"default"}
          className='w-full'
          onClick={() => setIsAddingTask(true)}
        >
          <Plus className='size-4' />
          Add Task
        </Button>
      </CardContent>
      <CardContent className={cn("px-6 pt-6 pb-5", !isAddingTask && "hidden")}>
        <Form {...form}>
          <form>
            <CardDescription className='pl-1 mb-2'>Task Name</CardDescription>
            <Input
              name='name'
              formControl={form.control}
              ref={inputRef}
              type='text'
              className='w-full mb-5'
            />
            <AddTaskForm form={form} mutateField={() => {}} />

            <div className='flex items-center mt-8 gap-3'>
              <Button
                variant={"outline"}
                size={"default"}
                className='w-full'
                type='submit'
              >
                Add Task
              </Button>

              <Button
                variant={"outline"}
                size={"default"}
                className='w-full'
                type='reset'
                onClick={() => {
                  setIsAddingTask(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function AddTaskForm({
  form,
  mutateField,
}: {
  form: UseFormReturn<any>;
  mutateField: (key: any) => void;
}) {
  const { spaceId } = useParams();
  const { data, isLoading } = useGetSpaceById(spaceId as string);
  if (isLoading) {
    return null;
  }
  return (
    <div className='gap-x-6 gap-y-2.5 grid grid-cols-2 '>
      <div>
        <CardDescription className='pl-1'>Assginee</CardDescription>
        <MultiSelect
          formControl={form.control}
          name='assignees'
          options={getUserOptions(data?.members || [])}
          icon={<User />}
          className='px-1 truncate hover:ring-0 data-[state=open]:ring-0 mt-0.5 whitespace-nowrap w-fit'
          onBlur={() => mutateField("assignees")}
        />
      </div>
      <div>
        <CardDescription className='pl-1'>Priority</CardDescription>
        <ComboBox
          formControl={form.control}
          name='priority'
          options={priorityOptions}
          icon={<Flag />}
          className={cn("truncate px-1 hover:ring-0 data-[state=open]:ring-0")}
          onBlur={() => mutateField("priority")}
        />
      </div>
      <div>
        <CardDescription className='pl-1'>Status</CardDescription>
        <ComboBox
          formControl={form.control}
          name='status'
          options={statusOptions}
          className={cn("truncate px-1 hover:ring-0 data-[state=open]:ring-0")}
          icon={<CircleDashed />}
          onBlur={() => mutateField("status")}
        />
      </div>
      <div>
        <CardDescription className='pl-1'>Due Date</CardDescription>
        <DatePicker
          formController={form.control}
          name='dueDate'
          className='px-1 hover:ring-0 data-[state=open]:ring-0'
          onBlur={() => mutateField("dueDate")}
        />
      </div>
    </div>
  );
}
