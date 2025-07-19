"use client";
import { CreateProjectDialog } from "./create-project-dialog";
import ProjectList from "./project-list";
import { Suspense } from "react";

export default function ProjectContent() {
  return (
    <div className='mt-6 max-lg:px-3'>
      <div className='flex items-center justify-between mt-2 mb-3.5'>
        <h1 className='text-2xl font-bold ml-1.5'> Projects</h1>
        <CreateProjectDialog />
      </div>
      <Suspense fallback={null}>
        <ProjectList />
      </Suspense>
    </div>
  );
}
