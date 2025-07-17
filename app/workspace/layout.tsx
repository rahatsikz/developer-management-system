import React, { Suspense } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import DMSSidebar from "@/components/shared/dms-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarHeader from "@/components/shared/sidebar-header";

export default function ProjectBoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <div className='font-sans h-screen grid grid-cols-12 bg-secondary/50'>
    //   <div className='col-span-2 hidden lg:block'>
    //     <div className='px-6 py-16'>Sidebar</div>
    //   </div>
    //   <div className=' col-span-12 lg:col-span-10 mx-4 mb-6 mt-12 rounded-xl bg-background  '>
    //     <ScrollArea className='px-8 py-2 h-[calc(100vh-90px)]'>
    //       {children}
    //     </ScrollArea>
    //   </div>
    // </div>
    <SidebarProvider>
      <DMSSidebar />
      <Suspense>
        <section className='w-full overflow-hidden'>
          <SidebarHeader />
          <ScrollArea className='h-[calc(100dvh-72.5px)] pb-6 bg-background md:h-[calc(100dvh-72.5px)] px-0 lg:px-6 py-0 lg:py-1 w-full'>
            <div>{children}</div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </section>
      </Suspense>
    </SidebarProvider>
  );
}
