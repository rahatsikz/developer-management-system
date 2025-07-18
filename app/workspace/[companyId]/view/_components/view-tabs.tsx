"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List, SquareKanban } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ViewTabs() {
  const router = useRouter();
  const { companyId, projectId } = useParams();

  const tabsArr = [
    {
      name: "List",
      route: "list",
      icon: <List className='size-4' />,
    },
    {
      name: "Board",
      route: "board",
      icon: <SquareKanban className='size-4' />,
    },
    {
      name: "Calendar",
      route: "calendar",
      icon: <Calendar className='size-4' />,
    },
  ];

  const handleNavigate = (path: string) => {
    router.push(`/workspace/${companyId}/view/${path}/${projectId}`);
    localStorage.setItem("view", path);
  };

  // useEffect(() => {
  //   const view = localStorage.getItem("view") || "list";
  //   router.push(`/${id}/view/${view}/${projectId}`);
  // }, [router, id, projectId]);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || typeof window === "undefined") {
    return <TabSkeleton tabslength={tabsArr.length} />;
  }

  return (
    <Tabs
      defaultValue={localStorage.getItem("view") || "list"}
      className='py-0 fixed w-full bg-background z-50 pt-1'
    >
      <TabsList className='bg-transparent justify-start border-b border-input rounded-none w-full px-6 py-1 gap-1.5 h-12 lg:max-w-[calc(100%-19rem)]'>
        {tabsArr.map((tab) => (
          <TabsTrigger
            key={tab.route}
            value={tab.route}
            onClick={() => handleNavigate(tab.route)}
            className='data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-muted-foreground gap-1.5 rounded-none border-b-2 border-transparent mt-2 font-normal py-2.5'
          >
            {tab.icon}
            <span>{tab.name}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

const TabSkeleton = ({ tabslength }: { tabslength: number }) => (
  <div dir='ltr' data-orientation='horizontal' className='py-2 animate-pulse'>
    <div
      role='tablist'
      aria-orientation='horizontal'
      className='inline-flex items-center p-1 text-muted-foreground bg-transparent justify-start border-b-2 border-input rounded-none w-full px-6 py-1 gap-1.5 h-12'
      tabIndex={0}
      data-orientation='horizontal'
      style={{ outline: "none" }}
    >
      {Array.from({ length: tabslength }).map((_, idx) => (
        <button
          key={idx}
          type='button'
          className='inline-flex items-center justify-center whitespace-nowrap px-3 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground data-[state=active]:shadow data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-muted-foreground gap-1.5 rounded-none border-b-2 border-transparent mt-2 font-normal py-2.5'
        >
          <div className='h-4 w-4 bg-muted-foreground rounded'></div>
          <span className='h-4 w-12 bg-muted-foreground rounded block ml-2'></span>
        </button>
      ))}
    </div>
  </div>
);
