"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { MultiEmailInputField } from "@/components/ui/multi-email-input";
import { useInviteEmployees } from "@/api/auth.query";

const formSchema = z.object({
  emails: z.array(z.string()).min(1, {
    message: "At least one email is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function InviteEmployeeDialog() {
  const [open, setOpen] = useState(false);

  const { mutate: inviteEmployees, isPending } = useInviteEmployees();
  const { companyId } = useParams();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emails: [],
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const data = {
        companyId: companyId as string,
        emails: values.emails,
      };
      inviteEmployees(data, {
        onSuccess: () => {
          toast.success("Invited successfully");
          form.reset();
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to invite employees");
        },
      });
    } catch (error) {
      console.error("Failed to invite employees:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Invite Employees
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Invite Employees</DialogTitle>
          <DialogDescription>
            Enter the email addresses of the employees to invite.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
            <MultiEmailInputField name='emails' />
            <div className='flex justify-end'>
              <Button type='submit' className='px-10'>
                {isPending ? "Inviting..." : "Invite"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
