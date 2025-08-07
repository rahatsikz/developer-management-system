"use client";

import { useEffect, useState } from "react";
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
import { useParams } from "next/navigation";
import { useCreateSpace } from "@/api/space.query";
import { useGetProfile } from "@/api/auth.query";
import { ComboBox } from "@/components/ui/ComboBox";
import { Project } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  project: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddSpaceDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: userData, isFetching } = useGetProfile();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const projectOptions = userData?.Project?.map((project: Project) => ({
    label: project.name,
    value: project.id,
  }));
  const { projectId } = useParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      project: projectId
        ? projectId
        : projectOptions && projectOptions[0]?.value,
    },
  });

  const { mutate: createSpace, isPending } = useCreateSpace();

  // console.log(userData);

  async function onSubmit(values: FormValues) {
    try {
      const data = {
        name: values.name,
        projectId: projectId ? (projectId as string) : values.project,
      };

      console.log("Space Data:", data);

      createSpace(data, {
        onSuccess: () => {
          toast.success("Space created successfully");
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["spaces"] });
            queryClient.invalidateQueries({ queryKey: ["profile"] });
          }, 100);
          // form.reset();
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to create space");
        },
      });
    } catch (error) {
      console.error("Failed to create space:", error);
    }
  }

  if (isFetching || !isMounted) return <div>Loading...</div>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Space
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create new space</DialogTitle>
          <DialogDescription>
            Enter the details for your new space.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <Input
              formControl={form.control}
              name='name'
              placeholder='Space name'
              disabled={isPending}
              className='capitalize placeholder:text-sm'
            />
            {!projectId && (
              <ComboBox
                formControl={form.control}
                name='project'
                // label='Project'
                options={projectOptions}
                className='w-full border-input border'
              />
            )}
            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                {isPending ? "Creating..." : "Create Space"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
