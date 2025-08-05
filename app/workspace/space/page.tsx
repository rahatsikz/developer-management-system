import { Suspense } from "react";
import { AddSpaceDialog } from "../projects/[projectId]/details/_components/add-space-dialog";
import SpaceList from "./_components/space-list";

export default function SpacePage() {
  return (
    <div className='mt-6 max-lg:px-3 px-1'>
      <div className='flex items-center justify-between mt-2 mb-3.5'>
        <h1 className='text-2xl font-bold ml-1.5'>Spaces</h1>
        <AddSpaceDialog />
      </div>
      <Suspense fallback={<div>loading....</div>}>
        <SpaceList />
      </Suspense>
    </div>
  );
}
