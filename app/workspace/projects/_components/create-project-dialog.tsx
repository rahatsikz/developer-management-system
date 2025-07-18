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
import { toast } from "sonner";
import { useCreateProject } from "@/api/project.query";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateProjectDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: createProject, isPending } = useCreateProject();

  async function onSubmit(values: FormValues) {
    try {
      // ! CHANGE USER ID and add Zustand
      const data = {
        name: values.name,
        companyId: "sad" as string,
      };
      createProject(data, {
        onSuccess: () => {
          toast.success("Project created successfully");
          queryClient.invalidateQueries({ queryKey: ["projects"] });
          form.reset();
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to create Project");
        },
      });
    } catch (error) {
      console.error("Failed to create Project:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Start new project</DialogTitle>
          <DialogDescription>
            Enter the details for your new project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <Input
              formControl={form.control}
              name='name'
              placeholder='Project name'
              disabled={isPending}
            />
            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                {isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
