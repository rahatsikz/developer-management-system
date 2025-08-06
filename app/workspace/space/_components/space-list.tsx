"use client";
import { useGetProfile } from "@/api/auth.query";
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
import { Folder, Layers, Loader2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SpaceList() {
  const { data, isFetching } = useGetProfile();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (isFetching || !isMounted)
    return (
      <div className='flex items-center gap-2'>
        <Loader2 className='animate-spin size-4' />
        <span>Loading...</span>
      </div>
    );

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
      {data?.Spaces?.map((space: Space) => (
        <SpaceCard key={space.id} {...{ space }} />
      ))}
    </div>
  );
}

function SpaceCard({ space }: { space: Space }) {
  return (
    <Link href={`/workspace/space/${space.id}/view/list`}>
      <Card className='overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary'>
        <CardHeader className='pb-3 space-y-3.5'>
          <CardTitle className='flex items-center gap-3 capitalize'>
            <span className='flex items-center gap-2'>
              <Layers className='h-5 w-5 text-muted-foreground' />
              {space.name}
            </span>
          </CardTitle>
          <CardDescription className='flex flex-col gap-1.5 text-xs'>
            <span className='text-xs tracking-normal text-muted-foreground flex items-center gap-1'>
              <Folder size={15} className='-mb-0.5' /> {space.project.name}
            </span>
            Created on {format(new Date(space.createdAt), "PP")}
          </CardDescription>
        </CardHeader>
        <CardContent className='pb-2'>
          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span>
                {space?.members?.length || 0}{" "}
                {space?.members?.length > 1 ? "users" : "user"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </Link>
  );
}
