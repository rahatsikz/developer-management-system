import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { formConfig } from "../../board/_components/FieldConfig";
import { renderField } from "../../board/_components/RenderField";
import { getUserAcronym } from "@/lib/acronym";
import { useUpdateTask } from "@/api/task.query";
import { useQueryClient } from "@tanstack/react-query";
import { useMutateField } from "../../list/_components/SortableRow";
import { Task } from "@/types";

const Card = ({ task }: { task: Task }) => {
  return (
    <div
      className={cn(
        "bg-muted/50 hover:bg-muted/90 min-h-16 flex flex-col gap-3 p-4 rounded"
      )}
    >
      <div className='flex items-center gap-3'>
        <p className='text-sm font-medium'>{task.title}</p>
      </div>
      <CardForm task={task} />
    </div>
  );
};

export default Card;

export function CardForm({ task }: { task: Task }) {
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
      <form className='space-y-0.5'>
        {formConfig.map((item, index) => (
          <div className='flex items-center w-9/12 gap-3' key={index}>
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
