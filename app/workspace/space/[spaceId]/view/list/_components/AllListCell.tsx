import { DatePicker } from "@/components/ui/DatePicker";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { CommentPopover } from "./CommentPopover";
import { ComboBox } from "@/components/ui/ComboBox";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { TableCell } from "@/components/ui/table";
import { UseFormReturn } from "react-hook-form";
import { Flag, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { priorityOptions, statusOptions } from "@/data";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useGetSpaceById } from "@/api/space.query";
import { getUserOptions } from "../../_components/add-task-dialog";

export const cellOfRows = (
  key: any,
  form: UseFormReturn<any>,
  data: any,
  mutateField: (key: any) => void

  // setTaskList: (list: any) => void
) => ({
  assignee: <AssigneeCell key={key} form={form} mutateField={mutateField} />,
  dueDate: (
    <TableCell key={key}>
      <form
      // onSubmit={form.handleSubmit(() => mutateField("dueDate"))}
      >
        <DatePicker
          formController={form.control}
          name='dueDate'
          onBlur={() => form.handleSubmit(() => mutateField("dueDate"))()}
        />
      </form>
    </TableCell>
  ),
  priority: (
    <TableCell key={key}>
      <form>
        <ComboBox
          formControl={form.control}
          name='priority'
          options={priorityOptions}
          icon={<Flag />}
          className={cn("truncate")}
          onBlur={() => form.handleSubmit(() => mutateField("priority"))()}
        />
      </form>
    </TableCell>
  ),
  status: (
    <TableCell key={key}>
      <form>
        <ComboBox
          formControl={form.control}
          name='status'
          options={statusOptions}
          className={cn("truncate")}
          onBlur={() => form.handleSubmit(() => mutateField("status"))()}
        />
      </form>
    </TableCell>
  ),
  comments: (
    <TableCell key={key}>
      <Popover modal={false}>
        <PopoverTrigger asChild>
          <Button
            className='flex items-center justify-start gap-2 hover:ring-2 hover:ring-primary hover:bg-background'
            variant='ghost'
          >
            <MessageCircle className='size-4  text-muted-foreground' />
            {data?.comments?.length ? data?.comments?.length : ""}
          </Button>
        </PopoverTrigger>

        <CommentPopover commnetsData={data.comments} />
      </Popover>
    </TableCell>
  ),
});

const AssigneeCell = ({
  form,
  mutateField,
}: {
  form: UseFormReturn<any>;
  mutateField: (key: any) => void;
}) => {
  const { spaceId } = useParams();
  const { data, isLoading } = useGetSpaceById(spaceId as string);
  if (isLoading) {
    return null;
  }
  return (
    <TableCell>
      <form>
        <MultiSelect
          formControl={form.control}
          name='assignees'
          options={getUserOptions(data?.members || [])}
          icon={<User />}
          className=' truncate'
          onBlur={() => form.handleSubmit(() => mutateField("assignees"))()}
        />
      </form>
    </TableCell>
  );
};
