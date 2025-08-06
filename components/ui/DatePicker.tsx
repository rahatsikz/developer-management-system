"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CalendarPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Control } from "react-hook-form";

export interface DatePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  formController: Control<any>;
  name: string;
}

export const DatePicker = React.forwardRef<HTMLDivElement, DatePickerProps>(
  ({ label, formController, name, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const utcMidnight = (date: Date) => {
      return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
      );
    };

    return (
      <FormField
        control={formController}
        name={name}
        render={({ field }) => (
          <FormItem className='flex flex-col w-full'>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    id={props.id}
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal border-0 shadow-none hover:ring-2 hover:ring-primary hover:bg-background  bg-transparent",
                      "data-[state=open]:ring-2 data-[state=open]:ring-primary data-[state=open]:bg-muted w-fit",
                      !field.value && "text-muted-foreground",
                      props.className
                    )}
                  >
                    {field.value ? (
                      <span className='inline-flex gap-2 items-center'>
                        <CalendarIcon className='lg:mr-1 size-4' />{" "}
                        <span className='block lg:hidden'>
                          {format(field.value, "MMM dd, yy")}
                        </span>
                        <span className='hidden lg:block'>
                          {format(field.value, "MMM dd, yyyy")}
                        </span>
                      </span>
                    ) : (
                      <CalendarPlus className='size-4' />
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' ref={ref}>
                <Calendar
                  mode='single'
                  defaultMonth={field.value}
                  selected={field.value}
                  onSelect={(date) => {
                    if (date) {
                      date = utcMidnight(date);
                      field.onChange(date.toISOString());
                      props.onBlur?.(date.toISOString() as any);
                    }

                    setIsOpen(false);
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);

DatePicker.displayName = "DatePicker";
