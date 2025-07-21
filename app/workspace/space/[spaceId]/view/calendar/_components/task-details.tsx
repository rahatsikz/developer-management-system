import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { formConfig } from "../../board/_components/FieldConfig";
import { renderField } from "../../board/_components/RenderField";

const Card = ({ task }: { task: any }) => {
  return (
    <div
      className={cn(
        "bg-muted/50 hover:bg-muted/90 min-h-16 flex flex-col gap-3 p-4 rounded"
      )}
    >
      <div className='flex items-center gap-3'>
        <p className='text-sm font-medium'>{task.name}</p>
      </div>
      <CardForm task={task} />
    </div>
  );
};

export default Card;

export function CardForm({ task }: { task: any }) {
  const form = useForm({
    defaultValues: {
      name: task.name,
      assignee: [
        {
          value: task?.assignee?.value,
          label: task?.assignee?.label,
          acronym: task?.assignee?.acronym,
          id: task?.assignee?.id,
        },
      ],
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    },
  });

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
            {renderField(item, form.control, task.id)}
          </div>
        ))}
      </form>
    </Form>
  );
}
