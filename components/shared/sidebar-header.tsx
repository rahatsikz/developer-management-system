"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Menu } from "lucide-react";
import Link from "next/link";
import { SidebarOptions } from "@/data";

export default function SidebarHeader() {
  const pathname = usePathname();
  const activeTab = SidebarOptions.find((item) => item.url === pathname);

  return (
    <>
      <div className='hidden min-h-[72.5px] bg-sidebar w-full items-center justify-between border-b px-7 shadow-lg md:flex'>
        <div className='flex w-full items-center gap-1 lg:gap-3'>
          <SidebarToggler />
          {activeTab && (
            <div className='flex items-center gap-2'>
              <div className='hidden size-8 items-center justify-center rounded-md bg-secondary md:flex'>
                <activeTab.icon
                  size={16}
                  //   active={"true"}
                  //   stroke={activeTab ? "#32BA55" : "#151A20"}
                />
              </div>
              <p className='font-medium text-foreground/80'>
                {activeTab.title}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className='md:hidden'>
        <div className='flex min-h-[69px] w-full items-center justify-between border-b px-6'>
          <div className='flex w-full items-center gap-2.5 lg:gap-3'>
            <SidebarToggler />
            <Link href={"/"} className=' flex'>
              <h1 className='my-auto text-center text-base font-semibold leading-none tracking-tight text-primary lg:text-[32px]'>
                Developer Management System
              </h1>
              {/* <InfoIcon className='ml-0.5 mt-1 h-2 w-2 text-[#32BA55]' /> */}
            </Link>
          </div>
        </div>
        {activeTab && (
          <div className='flex min-h-[59px] items-center gap-2 border-b px-6 shadow-lg'>
            <div className='flex size-8 items-center justify-center rounded-md bg-secondary'>
              <activeTab.icon
              // active={"true"}
              // className='size-4'
              // stroke={activeTab ? "#32BA55" : "#151A20"}
              />
            </div>
            <p className='font-medium text-foreground/80'>{activeTab.title}</p>
          </div>
        )}
      </div>
    </>
  );
}

const SidebarToggler = () => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return (
    <TooltipProvider delayDuration={350}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger>
            <Menu />
          </SidebarTrigger>
        </TooltipTrigger>
        <TooltipContent
          className='bg-foreground'
          align={isDesktop ? "center" : "start"}
        >
          <p>Toggle Sidebar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
