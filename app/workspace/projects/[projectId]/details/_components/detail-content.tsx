"use client";
import { useParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useGetProject } from "@/api/project.query";
import MemberTable from "./members-table";
import SpacesList from "./space-list";
import { AddSpaceDialog } from "./add-space-dialog";
import { AddNewMemberDialog } from "@/app/workspace/company/[companyId]/details/_components/add-member-dialog";
import { useDelayedSpinner } from "@/hooks/use-delayed-spinner";

export default function DetailContent() {
  const { projectId } = useParams();
  const { data, isLoading } = useGetProject(projectId as string);
  const { back } = useRouter();

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
    <div className='mt-6 h-[calc(100dvh-72.5px)] max-lg:px-3 px-1'>
      <button
        className='flex items-center gap-1 cursor-pointer'
        onClick={() => back()}
      >
        <ChevronLeft size={14} className='text-muted-foreground' />
        <span className='text-xs text-muted-foreground'>Go Back</span>
      </button>
      <div className='flex items-center justify-between mt-2 mb-3.5 px-1.5'>
        <h1 className='text-2xl font-bold '> {data?.name}</h1>
        <AddSpaceDialog />
      </div>
      <Suspense fallback={null}>
        <SpacesList />
      </Suspense>
      <div className='mt-6 mb-5 px-1.5 flex items-center justify-between'>
        <h2 className='text-lg font-bold '>Project Members</h2>
        <AddNewMemberDialog
          projectId={projectId as string}
          companyId={data?.company.id as string}
        />
      </div>
      <MemberTable
        data={data?.users ?? []}
        totalData={data?.users?.length ?? 0}
      />
    </div>
  );
}
