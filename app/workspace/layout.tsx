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
    <SidebarProvider>
      <DMSSidebar />
      <Suspense>
        <section className='w-full overflow-hidden'>
          <SidebarHeader />
          <ScrollArea className='h-[calc(100dvh-72.5px)] pb-6 bg-background md:h-[calc(100dvh-85.5px)] py-0 px-0 lg:px-6 lg:py-3 lg:pb-1 lg:pt-0 w-full '>
            <div>{children}</div>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
        </section>
      </Suspense>
    </SidebarProvider>
  );
}
