"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useCreateCompany } from "@/api/company.query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/use-auth-store";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateCompanyDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: createCompany, isPending } = useCreateCompany();
  const { user } = useAuthStore((state) => state);

  async function onSubmit(values: FormValues) {
    try {
      // ! CHANGE USER ID and add Zustand
      const data = {
        name: values.name,
        userId: user?.id ?? "",
      };
      createCompany(data, {
        onSuccess: () => {
          toast.success("Company created successfully");
          queryClient.invalidateQueries({ queryKey: ["companies"] });
          form.reset();
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to create company");
        },
      });
    } catch (error) {
      console.error("Failed to create company:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>
            Enter the details for your new company.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <Input
              formControl={form.control}
              name='name'
              placeholder='Company name'
              disabled={isPending}
            />
            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                {isPending ? "Creating..." : "Create Company"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
