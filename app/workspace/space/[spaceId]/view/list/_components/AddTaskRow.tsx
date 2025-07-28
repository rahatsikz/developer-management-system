import React, { useEffect, useRef, useState } from "react";
import { priorityOptions, statusOptions } from "@/data";
import { Button } from "@/components/ui/button";
import { CircleDashed, Flag, Plus, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { MultiSelect, OptionProps } from "@/components/ui/MultiSelect";
import { ComboBox } from "@/components/ui/ComboBox";
import { DatePicker } from "@/components/ui/DatePicker";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useColumnStore } from "@/store";
import { useCreateSubtask, useCreateTask } from "@/api/task.query";
import { useParams } from "next/navigation";
import { useGetSpaceById } from "@/api/space.query";
import { getUserOptions } from "../../_components/add-task-dialog";
import { useQueryClient } from "@tanstack/react-query";

export default function AddTaskRow({
  groupBy,
  isAddingTask,
  setIsAddingTask,
}: {
  groupBy: string;
  isAddingTask: string | null;
  setIsAddingTask: (val: string | null) => void;
}) {
  const columnArray = useColumnStore((state) => state.ColumnArr);

  const { mutate: createTask } = useCreateTask();
  const { spaceId } = useParams();

  const form = useForm({
    defaultValues: {
      title: "",
      assignees: [],
      status: "",
      priority: "",
      dueDate: "",
    },
  });

  const queryClient = useQueryClient();

  const handleAddTask = async (values: any) => {
    const data = {
      title: values.title,
      assigneeIds:
        values.assignees.map((assignee: OptionProps) => assignee.value) ?? [],
      priority: values.priority.toUpperCase(),
      dueDate: values.dueDate,
      spaceId: spaceId as string,
      status: values.status,
    };
    createTask(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        form.reset();
        setIsAddingTask(null);
      },
    });
    setIsAddingTask(null);
  };

  return (
    <TableRow>
      <TableCell className='group-hover:bg-transparent'></TableCell>
      <TableCell
        colSpan={columnArray.length}
        className='group-hover:bg-transparent'
      >
        <Form {...form}>
          <form
            className={cn(
              "flex 2xl:justify-between max-2xl:gap-8 pr-4",
              isAddingTask !== groupBy && "hidden"
            )}
            onSubmit={form.handleSubmit(handleAddTask)}
          >
            <TaskAddForm form={form} shouldFocus={isAddingTask === groupBy}>
              <div className='flex items-center gap-1'>
                <Button
                  variant='outline'
                  size={"sm"}
                  type='reset'
                  onClick={() => {
                    setIsAddingTask(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant={"default"}
                  type='submit'
                  className='ml-2 h-7'
                  size={"sm"}
                >
                  Add Task
                </Button>
              </div>
            </TaskAddForm>
          </form>
          <Button
            variant='ghost'
            className={cn(isAddingTask === groupBy && "hidden")}
            onClick={() => {
              setIsAddingTask(groupBy);
              form.reset();
            }}
          >
            <Plus /> Add Task
          </Button>
        </Form>
      </TableCell>
    </TableRow>
  );
}

export function AddSubTaskRow({
  showSubTask,
  mainRowId,
}: {
  showSubTask: (task: any) => void;
  mainRowId: string;
}) {
  const [isAddingTask, setIsAddingTask] = useState(true);
  const columnArray = useColumnStore((state) => state.ColumnArr);

  const { mutate: createSubtask } = useCreateSubtask(mainRowId);

  const form = useForm({
    defaultValues: {
      title: "",
      assignees: null,
      status: null,
      priority: null,
      dueDate: null,
      mainTaskId: mainRowId,
    },
  });

  const queryClient = useQueryClient();

  const handleAddSubTask = async (values: any) => {
    const data = {
      title: values.title,
      assigneeIds: values.assignees
        ? values.assignees.map((assignee: OptionProps) => assignee.value)
        : [],
      priority: values.priority,
      dueDate: values.dueDate,
      status: values.status,
    };

    createSubtask(data, {
      onSuccess: () => {
        showSubTask((prev: any) => {
          return {
            ...prev,
            open: prev.id === mainRowId ? true : prev.open,
          };
        });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        // setIsAddingTask(false);
        form.reset();
      },
    });
  };

  return (
    <TableRow className={cn(!isAddingTask && "hidden")}>
      <TableCell className='group-hover:bg-transparent'></TableCell>
      <TableCell
        colSpan={columnArray.length}
        className='group-hover:bg-transparent'
      >
        <Form {...form}>
          {isAddingTask && (
            <form
              className='flex 2xl:justify-between max-2xl:gap-14 pr-4'
              onSubmit={form.handleSubmit(handleAddSubTask)}
            >
              <TaskAddForm form={form} isSubTask={true}>
                <div className='flex items-center gap-1'>
                  <Button
                    variant='outline'
                    size={"sm"}
                    type='reset'
                    onClick={() => {
                      setIsAddingTask(false);
                      showSubTask((prev: any) => {
                        return {
                          ...prev,
                          open: prev.id === mainRowId ? false : prev.open,
                        };
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={"default"}
                    type='submit'
                    className='ml-2 h-7'
                    size={"sm"}
                  >
                    Save
                  </Button>
                </div>
              </TaskAddForm>
            </form>
          )}
        </Form>
      </TableCell>
    </TableRow>
  );
}

function TaskAddForm({
  form,
  children,
  isSubTask,
  shouldFocus,
}: {
  form: any;
  children?: React.ReactNode;
  isSubTask?: boolean;
  shouldFocus?: boolean;
}) {
  const { spaceId } = useParams();
  const { data, isLoading } = useGetSpaceById(spaceId as string);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [shouldFocus]);

  if (isLoading) return null;

  return (
    <>
      <Input
        name='title'
        placeholder={!isSubTask ? "Enter Task Name" : "Enter Sub task name"}
        className='w-60 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
        formControl={form.control}
        autoFocus={true}
        ref={inputRef}
      />
      <div className='flex gap-2 items-center'>
        <div className='inline-flex gap-1.5'>
          <MultiSelect
            formControl={form.control}
            name='assignees'
            options={getUserOptions(data?.members || [])}
            icon={<UserPlus />}
            className='w-fit truncate'
          />

          <DatePicker formController={form.control} name='dueDate' />

          <ComboBox
            formControl={form.control}
            name='priority'
            options={priorityOptions}
            icon={<Flag />}
            className={cn("w-fit truncate")}
            boxAlignment='end'
          />

          <ComboBox
            formControl={form.control}
            name='status'
            options={statusOptions}
            icon={<CircleDashed />}
            className={cn("truncate w-fit ")}
            boxAlignment='end'
          />
        </div>
        {children}
      </div>
    </>
  );
}
