"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Space } from "@/types";
import { format } from "date-fns";
import { Layers, Loader2, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useGetSpacesByProjectId } from "@/api/space.query";
import { AddSpaceMemberDialog } from "./add-space-member-dialog";
import { useDelayedSpinner } from "@/hooks/use-delayed-spinner";
import React, { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";

export default function SpacesList() {
  const { projectId } = useParams();
  const { data, isLoading } = useGetSpacesByProjectId(projectId as string);

  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

  const showSpinner = useDelayedSpinner(isLoading, !!data);

  if (showSpinner) {
    return (
      <div className='flex items-center gap-2'>
        <Loader2 className='animate-spin size-4' />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
      {data?.map((space: Space) => (
        <SpaceCard
          key={space.id}
          {...{ space }}
          setActiveSpaceId={setActiveSpaceId}
        />
      ))}
      {activeSpaceId && (
        <AddSpaceMemberDialog
          spaceId={activeSpaceId}
          projectId={projectId as string}
          onClose={() => setActiveSpaceId(null)}
        />
      )}
    </div>
  );
}

const SpaceCard = React.memo(function SpaceCard({
  space,
  setActiveSpaceId,
}: {
  space: Space;
  setActiveSpaceId: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <Card
      onClick={() =>
        startTransition(() => {
          router.push(`/workspace/space/${space.id}/view/list`);
        })
      }
      className='overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary'
    >
      <CardHeader className='pb-3 space-y-2'>
        <CardTitle className='flex items-center gap-2.5 tracking-normal capitalize'>
          <Layers className='size-[18px] text-muted-foreground' />
          {space.name}
        </CardTitle>
        <CardDescription>
          Created on {format(new Date(space.createdAt), "PP")}
        </CardDescription>
      </CardHeader>
      <CardContent className='pb-2'>
        <div className='flex items-center gap-4 text-sm'>
          <div className='flex items-center gap-1.5'>
            <Users className='h-4 w-4 text-muted-foreground' />
            <span>{space.members.length || 0} users</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className='justify-end'>
        <Button
          size={"sm"}
          onClick={(e) => {
            e.stopPropagation();
            setActiveSpaceId(space.id);
          }}
        >
          Add Member
        </Button>
      </CardFooter>
    </Card>
  );
});
