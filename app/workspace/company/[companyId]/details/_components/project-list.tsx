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
import { Folder, Loader2, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { AddNewMemberDialog } from "./add-member-dialog";
import { useEffect, useState } from "react";

export default function ProjectList() {
  const { companyId } = useParams();
  const { data, isFetching } = useGetProjects({
    companyId: companyId as string,
  });

  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFetching) {
      timeout = setTimeout(() => setShowSpinner(true), 500);
    } else {
      setShowSpinner(false);
    }

    return () => clearTimeout(timeout);
  }, [isFetching]);
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
      {data?.map((project: Project) => (
        <ProjectCard key={project.id} {...{ project }} />
      ))}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    // <Link href={`/workspace/company/${company.id}/details`}>
    <Card className='overflow-hidden cursor-pointer'>
      <CardHeader className='pb-3 space-y-2'>
        <CardTitle className='flex items-center gap-2'>
          <Folder className='h-5 w-5 text-muted-foreground' />
          {project.name}
        </CardTitle>
        <CardDescription>
          Created on {format(new Date(project.createdAt), "PP")}
        </CardDescription>
      </CardHeader>
      <CardContent className='pb-2'>
        <div className='flex items-center gap-4 text-sm'>
          <div className='flex items-center gap-1.5'>
            <Users className='h-4 w-4 text-muted-foreground' />
            <span>{project.users.length || 0} users</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className='justify-end'>
        <AddNewMemberDialog projectId={project.id} />
      </CardFooter>
    </Card>
    // </Link>
  );
}
