"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
// import { z } from "zod";

interface DataTableSearchProps {
  filterKey: string;
  dateQuery: Record<string, string>;
  setDateQuery: (
    value:
      | { from: string; to: string }
      | ((old: {
          from: string;
          to: string;
        }) => { from: string; to: string } | null)
      | null,
  ) => Promise<URLSearchParams>;
}

// const formSchema = z.object({
//   date: z.object({
//     from: z.union([z.string(), z.date()]).nullable(),
//     to: z.union([z.string(), z.date()]).nullable(),
//   }),
// });

export default function DataTableDateFilter({
  // filterKey,
  // dateQuery,
  setDateQuery,
  ...props
}: DataTableSearchProps & React.HTMLAttributes<HTMLInputElement>) {
  const form = useForm({
    defaultValues: {
      date: {
        from: null,
        to: null,
      },
    },
  });

  function onSubmit(values: any) {
    const { from, to } = values.date;
    if (from && to) {
      const formattedDates = formatDatesForUrl(from, to);
      setDateQuery(formattedDates).catch(console.error);
    }

    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-60 items-center gap-0 rounded-full border border-input focus:ring-1 focus:ring-ring lg:w-80"
      >
        <Popover>
          <FormField
            control={form.control}
            name={"date"}
            render={({ field }) => (
              <FormItem className="mb-0">
                <PopoverTrigger asChild>
                  <FormControl>
                    <div className="relative m-auto w-40 lg:w-60">
                      <CalendarIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start border-0 pl-11 shadow-none hover:bg-transparent hover:text-foreground focus-visible:ring-0 lg:pb-1.5",
                          // 'data-[state=open]:ring-1 data-[state=open]:ring-ring',
                          props.className,
                        )}
                      >
                        {field.value?.from ? (
                          field.value.to ? (
                            <>
                              {format(field.value.from, "LLL dd, y")} -{" "}
                              {format(field.value.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(field.value.from, "LLL dd, y")
                          )
                        ) : (
                          <span> Filter by Date </span>
                        )}
                      </Button>
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  // ref={ref}
                  className="w-auto p-0"
                  align="start"
                  style={props.style}
                >
                  <Calendar
                    mode="range"
                    defaultMonth={field.value.from ?? new Date()}
                    selected={(field.value as any) || undefined}
                    numberOfMonths={2}
                    onSelect={(value) => {
                      if (value) {
                        const fromDate = value.from
                          ? parseISO(value.from.toISOString())
                          : null;
                        const toDate = value.to
                          ? parseISO(value.to.toISOString())
                          : null;

                        field.onChange({ from: fromDate, to: toDate });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>

                <FormMessage />
              </FormItem>
            )}
          />
        </Popover>
        <Button
          type="submit"
          variant={"secondary"}
          size={"sm"}
          className="ml-auto h-10 rounded-e-full px-5 font-bold"
        >
          Filter
        </Button>
      </form>
    </Form>
  );
}

const formatDatesForUrl = (from: Date | string, to: Date | string) => {
  const formattedFrom = format(from as Date, "yyyy-MM-dd");
  const formattedTo = format(to as Date, "yyyy-MM-dd");

  return { from: formattedFrom, to: formattedTo };
};
