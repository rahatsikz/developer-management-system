import { DatePicker } from "@/components/ui/DatePicker";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { CommentPopover } from "./CommentPopover";
import { ComboBox } from "@/components/ui/ComboBox";
import { MultiSelect } from "@/components/ui/MultiSelect";
import { TableCell } from "@/components/ui/table";
import { UseFormReturn } from "react-hook-form";
import { Flag, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { dummyAssigne, priorityOptions, statusOptions } from "@/data";
import { Button } from "@/components/ui/button";

export const cellOfRows = (
  key: any,
  form: UseFormReturn<any>,
  data: any,
  setTaskList: (list: any) => void
) => ({
  assignee: (
    <TableCell key={key}>
      <form>
        <MultiSelect
          formControl={form.control}
          name='assignee'
          options={dummyAssigne}
          icon={<User />}
          className=' truncate'
        />
      </form>
    </TableCell>
  ),
  dueDate: (
    <TableCell key={key}>
      <form>
        <DatePicker formController={form.control} name='dueDate' />
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

        <CommentPopover
          commnetsData={data.comments}
          setTaskList={setTaskList}
          id={data.id}
        />
      </Popover>
    </TableCell>
  ),
});
