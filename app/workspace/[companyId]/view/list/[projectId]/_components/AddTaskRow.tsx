import React, { useEffect, useRef, useState } from "react";
import { dummyAssigne, priorityOptions, statusOptions } from "@/data";
import { Button } from "@/components/ui/button";
import { CircleDashed, Flag, Plus, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { ComboBox } from "@/components/ui/ComboBox";
import { DatePicker } from "@/components/ui/DatePicker";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useColumnStore } from "@/store";

export default function AddTaskRow() {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const columnArray = useColumnStore((state) => state.ColumnArr);

  const containerRef = useRef<HTMLTableRowElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const childRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const form = useForm({
    defaultValues: {
      name: "",
      assignee: null,
      status: null,
      priority: null,
      dueDate: null,
    },
  });

  const handleAddTask = () => {
    console.log(form.getValues());
    setIsAddingTask(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isScrollbarClick =
        event.target instanceof HTMLElement &&
        (event.target.className.includes("scrollbar") ||
          event.target.closest(".overflow-auto"));

      if (isScrollbarClick) {
        // Ignore clicks on the scrollbar
        return;
      }

      const isInsideContainer =
        containerRef && containerRef.current?.contains(event.target as Node);

      const isInsideChildren = childRefs.some((ref) =>
        ref.current?.contains(event.target as Node)
      );

      if (!isInsideContainer && !isInsideChildren) {
        setIsAddingTask(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAddingTask, childRefs]);

  return (
    <TableRow ref={containerRef}>
      <TableCell className='group-hover:bg-transparent'></TableCell>
      <TableCell
        colSpan={columnArray.length}
        className='group-hover:bg-transparent'
      >
        <Form {...form}>
          {isAddingTask ? (
            <form
              className='flex 2xl:justify-between max-2xl:gap-8 pr-4'
              onSubmit={form.handleSubmit(handleAddTask)}
            >
              <TaskAddForm form={form} childRefs={childRefs}>
                <div>
                  <Button
                    variant='outline'
                    size={"sm"}
                    type='reset'
                    onClick={() => setIsAddingTask(false)}
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
          ) : (
            <Button variant='ghost' onClick={() => setIsAddingTask(true)}>
              <Plus /> Add Task
            </Button>
          )}
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

  const containerRef = useRef<HTMLTableRowElement>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      assignee: null,
      status: null,
      priority: null,
      dueDate: null,
      mainTaskId: mainRowId,
    },
  });

  const handleAddSubTask = () => {
    console.log(form.getValues());
    setIsAddingTask(false);
  };

  return (
    <TableRow ref={containerRef} className={cn(!isAddingTask && "hidden")}>
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
              <TaskAddForm form={form}>
                <div>
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
  childRefs,
  children,
}: {
  form: any;
  childRefs?: {
    current: HTMLDivElement | null;
  }[];
  children?: React.ReactNode;
}) {
  return (
    <>
      <Input
        name='name'
        placeholder={childRefs ? "Enter Task Name" : "Enter Sub task name"}
        className='w-60 border-primary'
        formControl={form.control}
        autoFocus
      />
      <div className='flex gap-2 items-center'>
        <div className='inline-flex gap-1.5'>
          <MultiSelect
            formControl={form.control}
            name='assignee'
            options={dummyAssigne}
            icon={<UserPlus />}
            className='w-fit truncate'
            ref={childRefs && childRefs[0]}
          />

          <DatePicker
            formController={form.control}
            name='dueDate'
            ref={childRefs && childRefs[1]}
          />

          <ComboBox
            formControl={form.control}
            name='priority'
            options={priorityOptions}
            icon={<Flag />}
            className={cn("w-fit truncate")}
            boxAlignment='end'
            ref={childRefs && childRefs[2]}
          />

          <ComboBox
            formControl={form.control}
            name='status'
            options={statusOptions}
            icon={<CircleDashed />}
            className={cn("truncate w-fit ")}
            boxAlignment='end'
            ref={childRefs && childRefs[3]}
          />
        </div>
        {children}
      </div>
    </>
  );
}
