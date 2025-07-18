import { useState, KeyboardEvent } from "react";
import { useFormContext } from "react-hook-form";
import { X } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
}

export function MultiEmailInputField({ name, label, placeholder }: Props) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <EmailChipInput
              value={field.value || []}
              onChange={field.onChange}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function EmailChipInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["Enter", ","].includes(e.key)) {
      e.preventDefault();
      const email = input.trim();
      if (email && validateEmail(email) && !value.includes(email)) {
        onChange([...value, email]);
        setInput("");
      }
    }

    if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const removeEmail = (index: number) => {
    const newEmails = value.filter((_, i) => i !== index);
    onChange(newEmails);
  };

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  return (
    <div className='w-full border rounded-md p-2 min-h-[36px] flex flex-wrap items-center gap-2 focus-within:ring-2 focus-within:ring-ring'>
      {value.map((email, index) => (
        <span
          key={index}
          className='bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm flex items-center gap-1'
        >
          {email}
          <button type='button' onClick={() => removeEmail(index)}>
            <X className='h-4 w-4' />
          </button>
        </span>
      ))}
      <input
        type='text'
        className='flex-grow outline-none bg-transparent text-sm min-w-[120px] placeholder:text-xs placeholder:pl-2'
        placeholder={
          placeholder || "Type email and press Enter or comma to save"
        }
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
