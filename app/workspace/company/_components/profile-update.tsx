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
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthStore } from "@/store/use-auth-store";
import { useGetProfile, useUpdateProfile } from "@/api/auth.query";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function ProfileUpdateDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const { updateUser } = useAuthStore((state) => state);

  const { data: profileData } = useGetProfile();

  async function onSubmit(values: FormValues) {
    try {
      const data = {
        name: values.name,
      };
      updateProfile(data, {
        onSuccess: () => {
          updateUser({
            name: values.name,
          });
          toast.success("Profile updated successfully");
          queryClient.invalidateQueries({ queryKey: ["profile"] });
          form.reset();
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to update profile");
        },
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  }

  useEffect(() => {
    if (profileData?.id && !profileData?.name) {
      setTimeout(() => {
        setOpen(true);
      }, 500);
    }
  }, [profileData]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        // don't close if user name is not set
        if (!profileData?.name) {
          setOpen(true);
        } else {
          setOpen(false);
        }
      }}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Enter your info</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <Input
              formControl={form.control}
              name='name'
              placeholder='Enter your name'
              disabled={isPending}
              className='placeholder:pl-1 placeholder:text-sm'
            />
            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
