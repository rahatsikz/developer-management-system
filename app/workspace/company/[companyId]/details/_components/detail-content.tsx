"use client";
import { useParams, useRouter } from "next/navigation";
import { CreateProjectDialog } from "./create-project-dialog";
import ProjectList from "./project-list";
import { Suspense } from "react";
import { useGetCompany } from "@/api/company.query";
import { ChevronLeft, Loader2 } from "lucide-react";
import EmployeeTable from "./employee-table";
import { InviteEmployeeDialog } from "./invite-employee-dialog";

export default function DetailContent() {
  const { companyId } = useParams();
  const { data, isFetching } = useGetCompany(companyId as string);
  const { back } = useRouter();

  if (isFetching)
    return (
      <div className='flex h-60 items-center justify-center'>
        <Loader2 className='mr-2 animate-spin' />
        <span>Loading...</span>
      </div>
    );

  console.log(data);

  return (
    <div className='mt-6 h-[calc(100dvh-72.5px)] max-lg:px-3'>
      <button
        className='flex items-center gap-1 cursor-pointer'
        onClick={() => back()}
      >
        <ChevronLeft size={14} className='text-muted-foreground' />
        <span className='text-xs text-muted-foreground'>Go Back</span>
      </button>
      <div className='flex items-center justify-between mt-2 mb-3.5 px-1.5'>
        <h1 className='text-2xl font-bold '> {data.name}</h1>
        <CreateProjectDialog />
      </div>
      <Suspense fallback={null}>
        <ProjectList />
      </Suspense>

      <div className='mt-6 mb-5 px-1.5 flex items-center justify-between'>
        <h2 className='text-lg font-bold '>Employee List</h2>
        <InviteEmployeeDialog />
      </div>
      <EmployeeTable
        data={data.users ?? []}
        totalData={data?.users?.length ?? 0}
      />
    </div>
  );
}
