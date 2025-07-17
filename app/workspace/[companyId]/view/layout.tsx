import React from "react";
import ViewTabs from "./_components/view-tabs";

export default function ProjectBoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex flex-col gap-5'>
      <ViewTabs />
      <section className='lg:px-8 px-4 max-lg:mt-16'>{children}</section>
    </div>
  );
}
