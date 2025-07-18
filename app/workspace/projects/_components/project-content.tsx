"use client";
import { CreateProjectDialog } from "./create-project-dialog";
import ProjectList from "./project-list";
import { Suspense } from "react";

export default function ProjectContent() {
  return (
    <div className='mt-6'>
      <div className='flex items-center justify-between mt-2 mb-4'>
        <h1 className='text-2xl font-bold ml-1'> Projects</h1>
        <CreateProjectDialog />
      </div>
      <Suspense fallback={null}>
        <ProjectList />
      </Suspense>
    </div>
  );
}
