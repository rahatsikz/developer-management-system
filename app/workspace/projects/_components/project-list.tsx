"use client";
import { useGetProjects } from "@/api/project.query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Project } from "@/types";
import { format } from "date-fns";
import { Building2, Folder, Layers, Loader2, Users } from "lucide-react";
import Link from "next/link";

export default function ProjectList() {
  const { data, isFetching } = useGetProjects({});

  if (isFetching)
    return (
      <div className='flex items-center gap-2'>
        <Loader2 className='animate-spin size-4' />
        <span>Loading...</span>
      </div>
    );
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
      {data?.map((project: Project) => (
        <ProjectCard key={project.id} {...{ project }} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/workspace/projects/${project.id}/details`}>
      <Card className='overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary'>
        <CardHeader className='pb-3 space-y-3.5'>
          <CardTitle className='flex items-center gap-3 capitalize'>
            <span className='flex items-center gap-2'>
              <Folder className='h-5 w-5 text-muted-foreground' />
              {project.name}
            </span>
          </CardTitle>
          <CardDescription className='flex flex-col gap-1.5 text-xs'>
            <span className='text-xs tracking-normal text-muted-foreground flex items-center gap-1'>
              <Building2 size={15} className='-mb-0.5' /> {project.company.name}
            </span>
            Created on {format(new Date(project.createdAt), "PP")}
          </CardDescription>
        </CardHeader>
        <CardContent className='pb-2'>
          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span>
                {project.users.length || 0}{" "}
                {project.users.length > 1 ? "users" : "user"}
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Layers className='h-4 w-4 text-muted-foreground' />
              <span>
                {project.Spaces.length || 0}{" "}
                {project.Spaces.length > 1 ? "spaces" : "space"}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </Link>
  );
}
