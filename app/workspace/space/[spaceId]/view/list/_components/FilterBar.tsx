import React, { useState } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Grid2X2, GripVertical, Layers, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { groupOptions } from "@/data";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AddTaskDialog } from "../../_components/add-task-dialog";
import { useColumnStore } from "@/store/use-column-store";

const FilterBar = ({
  groupChangeHandler,
  meMode,
  setMeMode,
}: {
  groupChangeHandler: (group: string) => void;
  meMode: boolean;
  setMeMode: (meMode: boolean) => void;
}) => {
  const form = useForm({
    defaultValues: {
      group: groupOptions[2].value,
    },
  });

  const [isDragging, setIsDragging] = useState(false);

  const { ColumnArr, setColumns } = useColumnStore((state) => state);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!active?.id || !over?.id || active.id === over.id) return;

    const visibleColumns = ColumnArr.filter(
      (c) => c.checked && c.name !== "id"
    );

    const oldIndex = visibleColumns.findIndex((c) => c.id === active.id);
    const newIndex = visibleColumns.findIndex((c) => c.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedVisible = [...visibleColumns];
    const [moved] = reorderedVisible.splice(oldIndex, 1);
    reorderedVisible.splice(newIndex, 0, moved);

    // Now apply that order to the full ColumnArr
    const reorderedAll = [...ColumnArr];
    const visibleIds = reorderedVisible.map((col) => col.id);

    // making sure visible columns in the new order with unchecked columns position
    let newIndexInAll = 0;
    for (let i = 0; i < reorderedAll.length; i++) {
      if (visibleIds.includes(reorderedAll[i].id)) {
        reorderedAll[i] = reorderedVisible[newIndexInAll];
        newIndexInAll++;
      }
    }

    setColumns(reorderedAll);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <div className='mt-0.5 md:ml-0.5 flex  gap-1.5 md:gap-4 items-center max-md:justify-between 2xl:justify-between'>
      <Form {...form}>
        <form className='flex gap-1.5 md:gap-4 items-center'>
          <FormField
            control={form.control}
            name='group'
            render={({ field }) => (
              <FormItem className='mt-2'>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    groupChangeHandler(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='rounded-full !bg-background text-[11px] md:text-[13px] font-medium !text-muted-foreground [&>svg]:hidden px-4  hover:border-muted-foreground'>
                      <div className='flex items-center gap-2'>
                        <Layers className='size-3! md:size-3.5! text-muted-foreground' />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className='bg-background'>
                    {groupOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant='outline'
                className={cn(
                  "justify-start text-[11px] md:text-[13px] font-medium text-muted-foreground shadow-none hover:bg-background hover:border-muted-foreground bg-transparent  rounded-full",
                  "data-[state=open]:ring-2 data-[state=open]:ring-primary data-[state=open]:bg-muted data-[state=open]:text-foreground"
                )}
              >
                <Grid2X2 className='size-3! md:size-3.5!' />
                Columns
              </Button>
            </SheetTrigger>
            <SheetContent className='md:right-4 top-[118px] md:top-[125px] w-full md:bottom-1 h-auto rounded-e-xl'>
              <SheetHeader>
                <SheetTitle>Fields</SheetTitle>
                <SheetDescription></SheetDescription>
              </SheetHeader>
              <div className='mt-2'>
                <h3 className='text-muted-foreground text-sm mb-3 '>Shown</h3>
                {ColumnArr.filter((item) => item.label === "Name").map(
                  (field) => (
                    <IndividualField
                      key={field.id}
                      {...field}
                      dragging={isDragging}
                    />
                  )
                )}
                <DndContext
                  onDragEnd={handleDragEnd}
                  onDragStart={handleDragStart}
                >
                  <SortableContext items={ColumnArr.map((item) => item.id)}>
                    <div className='space-y-3 mt-3'>
                      {ColumnArr.filter(
                        (item) =>
                          item.checked &&
                          item.label !== "Name" &&
                          item.label !== "id"
                      ).map((field) => (
                        <IndividualField
                          key={field.id}
                          {...field}
                          dragging={isDragging}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                <h3 className='text-muted-foreground text-sm mt-6 mb-3'>
                  Hidden
                </h3>
                <div className='space-y-3'>
                  {ColumnArr.filter((item) => !item.checked).map((field) => (
                    <IndividualField
                      key={field.id}
                      {...field}
                      dragging={isDragging}
                    />
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            type='button'
            onClick={() => setMeMode(!meMode)}
            className={cn(
              "rounded-full border text-[11px] md:text-[13px]  bg-background text-muted-foreground hover:bg-background  hover:border-muted-foreground",
              meMode &&
                "bg-primary text-background hover:bg-primary border-primary"
            )}
          >
            <User className='size-3! md:size-3.5!' />
            <span>Me Mode</span>
          </Button>
        </form>
      </Form>
      <AddTaskDialog />
    </div>
  );
};

export default FilterBar;

function IndividualField({
  name,
  label,
  checked,
  id,
  dragging,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  dragging: boolean;
}) {
  const form = useForm({
    defaultValues: {
      [name]: checked,
    },
  });

  // const { watch } = form;

  // const checkedValue = watch(name);

  const { toggleColumn } = useColumnStore((state) => state);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString({
      x: 0,
      y: transform?.y ?? 0,
      scaleX: transform?.scaleX ?? 1,
      scaleY: transform?.scaleY ?? 1,
    }),
    transition,
  };

  return (
    <div
      className='flex items-center gap-3.5'
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <GripVertical
        {...(label === "Name" ? {} : listeners)}
        className={cn(
          "h-4 w-4 text-muted-foreground",
          dragging ? "cursor-grabbing" : "cursor-grab",
          label === "Name" && "cursor-not-allowed",
          !checked && "hidden"
        )}
      />
      <Form {...form}>
        <form className='w-full flex items-center'>
          <label
            htmlFor={id}
            className={cn(
              "text-sm",
              label === "Name" && "text-muted-foreground"
            )}
          >
            {label}
          </label>
          <Switch
            id={id}
            className='h-4 w-7'
            name={name}
            formControl={form.control}
            style={{ marginLeft: "auto" }}
            disabled={label === "Name"}
            onCheckedChange={() => {
              toggleColumn(name);
            }}
          />
        </form>
      </Form>
    </div>
  );
}
