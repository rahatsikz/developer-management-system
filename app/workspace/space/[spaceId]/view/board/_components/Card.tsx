import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { GripIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { formConfig } from "./FieldConfig";
import { renderField } from "./RenderField";
import { getUserAcronym } from "@/lib/acronym";
import { useUpdateTask } from "@/api/task.query";
import { Task } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useMutateField } from "../../list/_components/SortableRow";

const Card = ({ task }: { task: any }) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    isDragging,
    transition,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0 : 1,
    touchAction: "none",
  };

  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={cn(
        "bg-muted/50 hover:bg-muted/90 min-h-16 flex flex-col gap-3 p-4 rounded",
        isDragging ? "ring-2 ring-primary" : "",
        isFocused ? "bg-muted/90" : ""
      )}
      style={style}
    >
      <div className='flex items-center gap-3'>
        <GripIcon
          {...listeners}
          className={cn(
            isDragging ? "cursor-grabbing" : "cursor-grab",
            "size-4"
          )}
        />
        <p className='text-sm font-medium'>{task.title}</p>
      </div>
      <CardForm task={task} onFocus={handleFocus} onBlur={handleBlur} />
    </div>
  );
};

export default Card;

export function CardForm({
  task,
  onFocus,
  onBlur,
}: {
  task: Task;
  onFocus?: any;
  onBlur?: any;
}) {
  const form = useForm({
    defaultValues: {
      name: task.title,
      assignees: task.assignees.map((assignee: any) => ({
        value: assignee.id,
        label: assignee.name,
        id: assignee.id,
        acronym: getUserAcronym(assignee),
      })),
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    },
  });

  const { mutate } = useUpdateTask(task.id);
  const queryClient = useQueryClient();

  const mutateField = useMutateField(mutate, form, queryClient);

  return (
    <Form {...form}>
      <form className='space-y-0.5' onFocus={onFocus} onBlur={onBlur}>
        {formConfig.map((item, index) => (
          <div className='flex items-center w-full gap-3' key={index}>
            <Label
              htmlFor={item.name + task.id}
              className='text-muted-foreground w-20'
            >
              {item.label}
            </Label>
            {renderField(item, form.control, task.id, mutateField)}
          </div>
        ))}
      </form>
    </Form>
  );
}
