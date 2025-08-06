"use client";

import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { PopoverClose } from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export type OptionProps = {
  value: string;
  label: string;
  icon?: React.ReactNode;
};

type PopoverAlignment = "start" | "center" | "end";

export interface ComboBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  options: OptionProps[];
  label?: string;
  icon?: React.ReactNode;
  name: string;
  formControl: any;
  boxAlignment?: PopoverAlignment;
}

export const ComboBox = React.forwardRef<HTMLDivElement, ComboBoxProps>(
  (
    {
      options,
      label,
      icon,
      name,
      formControl,
      boxAlignment = "start",
      ...props
    },
    ref
  ) => {
    return (
      <FormField
        control={formControl}
        name={name}
        render={({ field }) => (
          <FormItem className='w-full'>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    id={props.id}
                    title={name.slice(0, 1).toUpperCase() + name.slice(1)}
                    variant='outline'
                    className={cn(
                      "justify-start border-0 shadow-none hover:ring-2 hover:ring-primary hover:bg-background bg-transparent font-normal",
                      "data-[state=open]:ring-2 data-[state=open]:ring-primary data-[state=open]:bg-muted",
                      props.className
                    )}
                    style={props.style}
                  >
                    {field.value ? (
                      <div className='flex items-center gap-2 '>
                        {
                          options.find((item) => item.value === field.value)
                            ?.icon
                        }
                        <span className='truncate'>
                          {
                            options.find((item) => item.value === field.value)
                              ?.label
                          }
                        </span>
                      </div>
                    ) : (
                      <span className={cn("text-muted-foreground")}>
                        {icon}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className='w-[200px] p-0'
                  align={boxAlignment}
                  ref={ref}
                >
                  <OptionList
                    onChange={(selectedOption) => {
                      field.onChange(selectedOption);
                      props.onBlur?.(selectedOption as any);
                    }}
                    options={options}
                  />
                </PopoverContent>
              </Popover>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);

ComboBox.displayName = "ComboBox";

function OptionList({
  onChange,
  options,
}: {
  onChange: (selectedOption: string | undefined) => void;
  options: OptionProps[];
}) {
  return (
    <Command>
      <CommandInput placeholder={`Filtering...`} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {options.map((item) => (
            <PopoverClose
              key={item.value}
              className='flex flex-col gap-4 w-full'
            >
              <CommandItem
                className='w-full cursor-pointer'
                value={item.value}
                onSelect={(value) => {
                  onChange(
                    options.find((indvidual) => indvidual.value === value)
                      ?.value
                  );
                }}
              >
                {item.icon} {item.label}
              </CommandItem>
            </PopoverClose>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
