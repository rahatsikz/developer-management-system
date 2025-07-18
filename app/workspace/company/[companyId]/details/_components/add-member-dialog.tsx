"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
import { toast } from "sonner";
import { useGetProject, useUpdateProject } from "@/api/project.query";
import { useParams } from "next/navigation";
import { MultiSelect, OptionProps } from "@/components/ui/MultiSelect";
import { useGetCompany } from "@/api/company.query";
import { User } from "@/types";
import { Loader2 } from "lucide-react";

export function AddNewMemberDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      members: [],
    },
  });

  const { mutate: updateProject, isPending } = useUpdateProject(projectId);
  const { companyId } = useParams();

  const { data: companyData, isFetching: companyIsFetching } = useGetCompany(
    companyId as string
  );
  const { data: projectData, isFetching: projectIsFetching } =
    useGetProject(projectId);

  //   console.log({ projectData, companyData });

  async function onSubmit(values: any) {
    try {
      const data = {
        userIds: values.members.map((member: OptionProps) => member.id) ?? [],
      };

      updateProject(data, {
        onSuccess: () => {
          toast.success("Team members updated successfully");
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
          }, 800);
          setOpen(false);
          form.reset();
        },
        onError: () => {
          toast.error("Failed to create Project");
        },
      });
    } catch (error) {
      console.error("Failed to create Project:", error);
    }
  }

  if (companyIsFetching || projectIsFetching) {
    return (
      <div className='flex h-60 items-center justify-center'>
        <Loader2 className='mr-2 animate-spin' />
        <span>Loading...</span>
      </div>
    );
  }

  const availableMembers = getAvailableUserOptions(
    companyData?.users,
    projectData?.users
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState) {
          // Dialog is trying to close
          if (isMultiSelectOpen) {
            // If MultiSelect is open, close MultiSelect first and prevent dialog from closing
            setIsMultiSelectOpen(false);
          } else {
            // If MultiSelect is not open, allow dialog to close
            setOpen(false);
          }
        } else {
          // Dialog is trying to open, allow it
          setOpen(true);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size={"sm"}>Add Member</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add new members</DialogTitle>
          <DialogDescription>
            Add new members to your project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // ⛔️ stop browser default
              e.stopPropagation(); // ⛔️ stop dialog from auto-closing
              form.handleSubmit(onSubmit)(e); // ✅ your actual submit logic
            }}
            className='space-y-4'
          >
            <MultiSelect
              formControl={form.control}
              className='w-full border-2 border-input pl-2 py-5 data-[state=open]:bg-background focus-visible:ring-1 focus-visible:ring-ring'
              name='members'
              options={availableMembers ?? []}
              placeholder='Select members'
              open={isMultiSelectOpen} // Pass controlled open state
              onOpenChange={setIsMultiSelectOpen} // Pass handler to update state
            />
            <DialogFooter>
              <Button type='submit' disabled={isPending}>
                {isPending ? "Adding..." : "Add to Project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function getAvailableUserOptions(
  companyUsers: User[],
  projectUsers: User[]
): OptionProps[] {
  // Step 1: Build a Set of project user IDs for fast lookup
  const projectUserIds = new Set(projectUsers.map((u) => u.id));

  // Step 2: Filter out users already on the project
  const candidates = companyUsers.filter((u) => !projectUserIds.has(u.id));

  // Step 3: Generate unique acronyms
  const usedAcronyms = new Set<string>();
  const makeUnique = (base: string) => {
    let acronym = base;
    let i = 2;
    // If there's a clash, extend by one more character:
    while (usedAcronyms.has(acronym)) {
      acronym = base.slice(0, ++i).toUpperCase();
    }
    usedAcronyms.add(acronym);
    return acronym;
  };

  return candidates.map((user) => {
    // Preferred source for acronym: name if available, else email
    const source = user.name?.trim() || user.email;
    // Take first 2 letters (uppercased)
    const raw = source.replace(/\s+/g, "").slice(0, 2).toUpperCase();
    const acronym = makeUnique(raw);

    return {
      value: user.id,
      label: user.name?.trim() || user.email,
      id: user.id,
      acronym,
    };
  });
}
