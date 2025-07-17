import * as React from "react";

import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Control } from "react-hook-form";

interface InputProps extends React.ComponentProps<"input"> {
  formControl: Control<any>;
  label?: string;
  name: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, formControl, label, name, type, ...props }, ref) => {
    return (
      <FormField
        control={formControl}
        name={name}
        render={({ field }) => (
          <FormItem className='flex flex-col gap-2'>
            {label && <FormLabel className='pl-1'>{label}</FormLabel>}
            <FormControl>
              <input
                type={type}
                className={cn(
                  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-sm",
                  className
                )}
                // autoComplete='off'
                {...field}
                {...props}
                ref={ref}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
