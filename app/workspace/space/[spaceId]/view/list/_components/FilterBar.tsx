import React, { useEffect, useState } from "react";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Grid2X2, GripVertical, Layers } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { dummyFields, groupOptions } from "@/data";
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
import { DndContext } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useColumnStore } from "@/store";
import { AddTaskDialog } from "../../_components/add-task-dialog";

const FilterBar = () => {
  const form = useForm({
    defaultValues: {
      group: groupOptions[2].value,
    },
  });

  const [isDragging, setIsDragging] = useState(false);
  const [columnFields, setColumnFields] = useState(dummyFields);
  const addToColumnArray = useColumnStore((state) => state.AddToColumnArray);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!active?.id || !over?.id || active.id === over.id) return;

    const activeItem = columnFields.find((item: any) => item.id === active.id);
    const overItem = columnFields.find((item: any) => item.id === over.id);

    if (activeItem && overItem) {
      setColumnFields((prev: any) => {
        // Find the positions of active and over items in the full task list
        const oldIndex = prev.findIndex(
          (item: any) => item.id === activeItem.id
        );
        const newIndex = prev.findIndex((item: any) => item.id === overItem.id);

        if (oldIndex === -1 || newIndex === -1) return prev;

        // Reorder the full task list
        const updatedList = [...prev];
        const [movedItem] = updatedList.splice(oldIndex, 1);
        updatedList.splice(newIndex, 0, movedItem);

        return updatedList;
      });
    }
  };

  useEffect(() => {
    addToColumnArray(
      columnFields.filter((item) => item.checked).map((item: any) => item.name)
    );
  }, [columnFields, addToColumnArray]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  return (
    <div className='mt-0.5 ml-0.5 flex items-center justify-between'>
      <Form {...form}>
        <form className='flex gap-4 items-center'>
          <FormField
            control={form.control}
            name='group'
            render={({ field }) => (
              <FormItem className='mt-2'>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='rounded-full !bg-background text-sm !text-muted-foreground [&>svg]:hidden px-4'>
                      <div className='flex items-center gap-1'>
                        <Layers className='mr-2 h-4 w-4 text-muted-foreground' />
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
                  "justify-start text-muted-foreground shadow-none hover:bg-background hover:border-muted-foreground bg-transparent font-normal rounded-full",
                  "data-[state=open]:ring-2 data-[state=open]:ring-primary data-[state=open]:bg-muted data-[state=open]:text-foreground"
                )}
              >
                <Grid2X2 className='size-4' />
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
                {columnFields
                  .filter((item) => item.label === "Name")
                  .map((field) => (
                    <IndividualField
                      key={field.id}
                      {...field}
                      updateColumn={setColumnFields}
                      dragging={isDragging}
                    />
                  ))}
                <DndContext
                  onDragEnd={handleDragEnd}
                  onDragStart={handleDragStart}
                >
                  <SortableContext items={columnFields.map((item) => item.id)}>
                    <div className='space-y-3 mt-3'>
                      {columnFields
                        .filter((item) => item.checked && item.label !== "Name")
                        .map((field) => (
                          <IndividualField
                            key={field.id}
                            {...field}
                            updateColumn={setColumnFields}
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
                  {columnFields
                    .filter((item) => !item.checked)
                    .map((field) => (
                      <IndividualField
                        key={field.id}
                        {...field}
                        updateColumn={setColumnFields}
                        dragging={isDragging}
                      />
                    ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
  updateColumn,
  dragging,
}: {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  updateColumn: (columns: any) => void;
  dragging: boolean;
}) {
  const form = useForm({
    defaultValues: {
      [name]: checked,
    },
  });

  const { watch } = form;

  const checkedValue = watch(name);

  useEffect(() => {
    updateColumn((prev: any) =>
      prev.map((item: any) =>
        item.id === id ? { ...item, checked: checkedValue } : item
      )
    );
  }, [checkedValue, id, updateColumn]);

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
          />
        </form>
      </Form>
    </div>
  );
}
