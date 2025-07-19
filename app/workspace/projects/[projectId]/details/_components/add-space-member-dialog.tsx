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
import { useGetProject } from "@/api/project.query";
import { MultiSelect, OptionProps } from "@/components/ui/MultiSelect";
import { User } from "@/types";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useGetSpaceById, useUpdateSpace } from "@/api/space.query";

export function AddSpaceMemberDialog({
  projectId,
  spaceId,
}: {
  projectId: string;
  spaceId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      members: [],
    },
  });

  const { mutate: updateSpace, isPending } = useUpdateSpace(spaceId);

  const { data: projectData, isFetching: companyIsFetching } = useGetProject(
    projectId as string
  );
  const { data: spaceData, isFetching: projectIsFetching } =
    useGetSpaceById(spaceId);

  //   console.log({ projectData, projectData });

  const { projectId: projectIdParam } = useParams();

  async function onSubmit(values: any) {
    try {
      const data = {
        userIds: values.members.map((member: OptionProps) => member.id) ?? [],
      };

      updateSpace(data, {
        onSuccess: () => {
          toast.success("Team members added to space");
          setTimeout(() => {
            if (!projectIdParam) {
              queryClient.invalidateQueries({ queryKey: ["space"] });
            } else {
              queryClient.invalidateQueries({ queryKey: ["spaces"] });
              queryClient.invalidateQueries({ queryKey: ["space"] });
            }
          }, 800);
          setOpen(false);
          form.reset();
        },
        onError: () => {
          toast.error("Failed to add members to space");
        },
      });
    } catch (error) {
      console.error("Failed to add members to space", error);
    }
  }

  if (companyIsFetching || projectIsFetching) {
    return null;
  }

  const availableMembers = getAvailableUserOptions(
    projectData?.users ?? [],
    spaceData?.members ?? []
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
        {!projectIdParam ? (
          <Button>
            <Plus className='mr-1 size-4' />
            Add Member
          </Button>
        ) : (
          <Button size={"sm"}>Add Member</Button>
        )}
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
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
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
                {isPending ? "Adding..." : "Add to Space"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function getAvailableUserOptions(
  projectUsers: User[],
  spaceUsers: User[]
): OptionProps[] {
  // Step 1: Build a Set of project user IDs for fast lookup
  const spaceUserIds = new Set(spaceUsers.map((u) => u.id));

  // Step 2: Filter out users already on the project
  const candidates = projectUsers.filter((u) => !spaceUserIds.has(u.id));

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
