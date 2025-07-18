import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, ChevronRight, Edit, GripIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { statusOptions } from "@/data";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { formatISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { AddSubTaskRow } from "./AddTaskRow";
import { useColumnStore } from "@/store";
import { cellOfRows } from "./AllListCell";

export function SortbaleRow({
  data,
  isDragging,
  setTaskList,
}: {
  data: any;
  isDragging: boolean;
  setTaskList: (list: any) => void;
}) {
  const [subTasksOpen, setSubTasksOpen] = useState({
    id: data.id,
    open: false,
  });

  const columnArr = useColumnStore((state) => state.ColumnArr);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: data.id });

  const style = {
    transform: CSS.Transform.toString({
      x: 0,
      y: transform?.y ?? 0,
      scaleX: transform?.scaleX ?? 1,
      scaleY: transform?.scaleY ?? 1,
    }),
    transition,
  };

  const form = useForm({
    defaultValues: {
      name: data.name,
      assignee: [
        {
          value: data?.assignee?.value,
          label: data?.assignee?.label,
          acronym: data?.assignee?.acronym,
          id: data?.assignee?.id,
        },
      ],
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate,
    },
  });

  const { watch } = form;

  // Watching for changes to the `assigne` field
  const [assignee, status, priority, dueDate] = [
    watch("assignee"),
    watch("status"),
    watch("priority"),
    watch("dueDate"),
  ];
  useEffect(() => {
    // Create a mapping of the watched fields to their corresponding keys in the task
    const updates = {
      assignee: assignee,
      status: status,
      priority: priority,
      dueDate: dueDate && formatISO(dueDate),
    };

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setTaskList((prev: any) =>
          prev.map((item: any) => {
            if (item.id === data.id) {
              return { ...item, [key]: value };
            }
            return item;
          })
        );
      }
    });
  }, [assignee, data.id, priority, setTaskList, status, dueDate]);

  useEffect(() => {
    if (subTasksOpen.open && isDragging) {
      setSubTasksOpen({
        id: data.id,
        open: false,
      });
    }
  }, [data.id, isDragging, subTasksOpen.open]);

  // to edit the task name
  const [isNameEditing, setIsNameEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleButtonRef = useRef<HTMLButtonElement>(null);

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
  }, [isNameEditing, data.id]);

  return (
    <>
      <TableRow
        key={data?.id}
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          "group",
          subTasksOpen.open && data.id === subTasksOpen.id && "bg-muted"
        )}
      >
        <TableCell className='w-12'>
          <div
            {...listeners}
            className={cn(
              isDragging ? "cursor-grabbing" : "cursor-grab",
              "w-fit"
            )}
          >
            <GripIcon className='size-4' />
          </div>
        </TableCell>
        <Form {...form}>
          <TableCell
            className={cn(
              "flex items-center gap-2 w-full sticky left-0 bg-background ",
              subTasksOpen.open && data.id === subTasksOpen.id && "bg-muted",
              isDragging && "bg-transparent border-b-0"
            )}
          >
            <Button
              className={cn(
                data.subTasks?.length === 0 &&
                  !subTasksOpen.open &&
                  "opacity-0",
                isDragging ? "" : "group-hover:opacity-100"
              )}
              ref={toggleButtonRef}
              variant='ghost'
              size='sm'
              onClick={() =>
                setSubTasksOpen({
                  id: data.id,
                  open:
                    subTasksOpen.id === data.id
                      ? !subTasksOpen.open
                      : subTasksOpen.open,
                })
              }
            >
              <ChevronRight
                className={cn(
                  subTasksOpen.open && "rotate-90",
                  data.subTasks?.length === 0 && "text-muted-foreground"
                )}
              />
            </Button>
            <div
              className=' flex items-center w-full justify-between'
              ref={containerRef}
            >
              <div
                className={cn(
                  isNameEditing
                    ? "hidden"
                    : "flex items-center justify-between w-full"
                )}
              >
                <p className='line-clamp-1'>{data?.name}</p>
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  onClick={() => setIsNameEditing(true)}
                  className={cn(
                    "opacity-0  transition-opacity",
                    isDragging ? "" : "group-hover:opacity-100"
                  )}
                >
                  <Edit />
                </Button>
              </div>
              <form
                onSubmit={form.handleSubmit(() => {
                  // console.log(form.getValues().name);
                  setTaskList((prev: any) =>
                    prev.map((item: any) => {
                      if (item.id === data.id) {
                        return {
                          ...item,
                          name: form.getValues().name,
                        };
                      }
                      return item;
                    })
                  );
                  setIsNameEditing(false);
                })}
                className={cn(
                  isNameEditing
                    ? "flex justify-between items-center gap-4 w-full"
                    : "hidden"
                )}
              >
                <Input
                  name='name'
                  formControl={form.control}
                  ref={inputRef}
                  type='text'
                  className='border-0 shadow-none px-0 py-0 h-auto focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-40'
                />
                <Button size={"icon"} variant={"ghost"} type='submit'>
                  <Check
                    style={{ strokeWidth: "4px" }}
                    className='text-primary'
                  />
                </Button>
              </form>
            </div>
          </TableCell>

          {columnArr.map(
            (item: any) =>
              cellOfRows(item, form, data, setTaskList)[
                item as keyof typeof cellOfRows
              ]
          )}
        </Form>
      </TableRow>
      {data?.subTasks?.length > 0 &&
        data.subTasks.map((item: any) => (
          <SubtaskRow
            key={item?.id}
            data={item}
            setTaskList={setTaskList}
            showSubTasks={subTasksOpen}
            mainRowId={data.id}
          />
        ))}
      {subTasksOpen.open && (
        <AddSubTaskRow showSubTask={setSubTasksOpen} mainRowId={data.id} />
      )}
    </>
  );
}

function SubtaskRow({
  data,
  setTaskList,
  showSubTasks,
  mainRowId,
}: {
  data: any;
  setTaskList: (list: any) => void;
  showSubTasks: { id: string; open: boolean };
  mainRowId: string;
}) {
  const columnArr = useColumnStore((state) => state.ColumnArr);

  const form = useForm({
    defaultValues: {
      name: data.name,
      assignee: [
        {
          value: data.assignee.value,
          label: data.assignee.label,
          acronym: data.assignee.acronym,
          id: data.assignee.id,
        },
      ],
      status: data.status || statusOptions[0].value,
      priority: data.priority,
      dueDate: data.dueDate,
    },
  });

  const { watch } = form;

  // Watching for changes to the `assigne` field
  const [assignee, status, priority, dueDate] = [
    watch("assignee"),
    watch("status"),
    watch("priority"),
    watch("dueDate"),
  ];
  useEffect(() => {
    // Create a mapping of the watched fields to their corresponding keys in the task
    const updates = {
      assignee: assignee,
      status: status,
      priority: priority,
      dueDate: dueDate && formatISO(dueDate),
    };

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        setTaskList((prev: any) =>
          prev.map((task: any) => {
            if (task.id === mainRowId) {
              return {
                ...task,
                subTasks: (task.subTasks || []).map((subTask: any) => {
                  if (subTask.id === data.id) {
                    return { ...subTask, [key]: value };
                  }
                  return subTask;
                }),
              };
            }
            return task;
          })
        );
      }
    });
  }, [assignee, mainRowId, priority, setTaskList, status, dueDate, data.id]);

  // to edit the task name
  const [isNameEditing, setIsNameEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNameEditing && inputRef.current) {
      inputRef.current.focus();
    }

    // Handle clicks outside the container
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsNameEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNameEditing]);

  return (
    <TableRow
      key={data?.id}
      className={cn(showSubTasks.open ? "" : "hidden", "group")}
    >
      <TableCell></TableCell>
      <Form {...form}>
        <TableCell className='sticky left-0 bg-background pl-4'>
          {/* <div className='min-w-16 max-w-28 truncate ml-4'>{data?.name}</div> */}
          <div
            className=' flex items-center w-full justify-between'
            ref={containerRef}
          >
            <div
              className={cn(
                isNameEditing
                  ? "hidden"
                  : "flex items-center justify-between w-full"
              )}
            >
              <p className='line-clamp-1'>{data?.name}</p>
              <Button
                size={"icon"}
                variant={"ghost"}
                onClick={() => setIsNameEditing(true)}
                className={cn(
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
                )}
              >
                <Edit />
              </Button>
            </div>
            <form
              onSubmit={form.handleSubmit(() => {
                // console.log(form.getValues().name);
                setTaskList((prev: any) =>
                  prev.map((task: any) => {
                    if (task.id === mainRowId) {
                      return {
                        ...task,
                        subTasks: (task.subTasks || []).map((subTask: any) => {
                          if (subTask.id === data.id) {
                            return {
                              ...subTask,
                              name: form.getValues().name,
                            };
                          }
                          return subTask;
                        }),
                      };
                    }
                    return task;
                  })
                );
                setIsNameEditing(false);
              })}
              className={cn(
                isNameEditing
                  ? "flex justify-between items-center gap-4 w-full"
                  : "hidden"
              )}
            >
              <Input
                name='name'
                formControl={form.control}
                ref={inputRef}
                type='text'
                className='border-0 shadow-none px-0 py-0 h-auto focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'
              />
              <Button size={"icon"} variant={"ghost"} type='submit'>
                <Check
                  style={{ strokeWidth: "4px" }}
                  className='text-primary'
                />
              </Button>
            </form>
          </div>
        </TableCell>

        {columnArr.map(
          (item: any) =>
            cellOfRows(item, form, data, setTaskList)[
              item as keyof typeof cellOfRows
            ]
        )}
      </Form>
    </TableRow>
  );
}
