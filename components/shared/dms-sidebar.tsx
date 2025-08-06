"use client";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
// import InfoIcon from "@/components/Svgs/InfoIcon";
// import undoIcon from "@/assets/images/backarrow.png";
// import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut } from "lucide-react";
import { useGetProfile, useLogout } from "@/api/auth.query";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "sonner";
import { SidebarOptions } from "@/data";
import { Space } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export default function DMSSidebar() {
  const pathname = usePathname();

  const [active, setActive] = useState(pathname);
  const { open, isMobile, setOpenMobile } = useSidebar();

  const { mutate: logout } = useLogout();
  const { setUser } = useAuthStore((state) => state);
  const { data: userData } = useGetProfile();

  const [openAccordion, setOpenAccordion] = useState<string | undefined>(() => {
    const match = userData?.Spaces?.find((space: Space) =>
      pathname.includes(`/space/${space.id}`)
    );
    return match?.id;
  });

  useEffect(() => {
    const match = userData?.Spaces?.find((space: Space) =>
      pathname.includes(`/space/${space.id}`)
    );
    if (match?.id) setOpenAccordion(match.id);
  }, [pathname, userData?.Spaces]);

  const handleLogOut = () => {
    logout(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully");
        setUser(null);
        window.location.href = "/sign-in";
      },
    });
  };

  return (
    <>
      <Sidebar
        className={cn(
          "bg-background",
          isMobile && "rounded-none rounded-e-2xl"
        )}
        collapsible='icon'
        variant='sidebar'
      >
        {open ? <SidebarHeaderPart /> : null}

        <SidebarContent className={cn(open ? "" : "mt-[19px]")}>
          <SidebarGroupContent className='overflow-y-hidden'>
            <ScrollArea className='h-full'>
              <SidebarMenu className={cn(open && "px-3")}>
                {SidebarOptions.map((item) => (
                  <SidebarMenuItem
                    className='flex flex-col items-center justify-center'
                    key={item.title}
                  >
                    <SidebarMenuButton
                      asChild
                      onMouseEnter={() => {
                        setActive(item.url);
                      }}
                      onMouseLeave={() => setActive(pathname)}
                      isActive={pathname.includes(item.url)}
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <Link
                        href={item.url}
                        className={cn(
                          active.includes(item.url)
                            ? "bg-muted-foreground/10 text-success"
                            : "",
                          "mx-0 w-full py-5 px-3"
                        )}
                      >
                        <item.icon
                          className={cn(
                            pathname.includes(item.url) && "text-success"
                          )}
                        />
                        <span
                          className={cn(
                            "font-medium pl-1",
                            pathname.includes(item.url) && "text-success"
                          )}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                    {item.title === "Spaces" &&
                      pathname.includes(item.url) &&
                      userData?.Spaces?.length > 0 && (
                        <div className='my-2.5 text-left w-full ml-3'>
                          <Accordion
                            type='single'
                            collapsible
                            className='mr-2'
                            value={openAccordion}
                            onValueChange={setOpenAccordion}
                          >
                            {userData?.Spaces?.map((space: Space) => (
                              <AccordionItem
                                key={space.id}
                                value={space.id}
                                className='border-b-0'
                              >
                                <AccordionTrigger
                                  className={cn(
                                    "hover:no-underline pt-0.5 pb-2.5 text-base font-medium"
                                  )}
                                >
                                  {space.name}
                                </AccordionTrigger>
                                <AccordionContent className='flex flex-col gap-1.5'>
                                  <Link
                                    href={`/workspace/space/${space.id}`}
                                    className={cn(
                                      pathname.endsWith(`/${space.id}`) &&
                                        "text-success",
                                      "font-medium"
                                    )}
                                  >
                                    Overview
                                  </Link>
                                  <Link
                                    href={`/workspace/space/${space.id}/view/list`}
                                    className={cn(
                                      pathname.includes(
                                        `/${space.id}/view/list`
                                      ) && "text-success",
                                      "font-medium"
                                    )}
                                  >
                                    Tasks
                                  </Link>
                                  <Link
                                    href={`/workspace/space/${space.id}/chat`}
                                    className={cn(
                                      pathname.includes(`/${space.id}/chat`) &&
                                        "text-success",
                                      "font-medium"
                                    )}
                                  >
                                    Chat
                                  </Link>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        </div>
                      )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarContent>
        <SidebarFooter className='mt-3 mb-0 px-0'>
          <Separator />
          <SidebarMenu className='gap-0 px-2'>
            {[
              {
                title: "Log out",
                url: "/logout",
                icon: () => <LogOut />,
              },
            ].map((item) => (
              <SidebarMenuItem
                className='flex items-center justify-center'
                key={item.title}
              >
                <SidebarMenuButton
                  className={cn("hover:text-destructive cursor-pointer")}
                  asChild
                  onMouseEnter={() => {
                    setActive(item.url ?? "");
                  }}
                  onMouseLeave={() => setActive(pathname)}
                  isActive={pathname === item.url}
                >
                  <button
                    onClick={handleLogOut}
                    className={cn(
                      active === item.url
                        ? "bg-muted-foreground/10 text-destructive"
                        : "",
                      "mx-0 w-full py-5"
                    )}
                  >
                    <item.icon
                    //   active={
                    //     active === item.url || pathname === item.url
                    //       ? "true"
                    //       : "false"
                    //   }
                    />
                    <span
                      className={cn(
                        "font-medium",
                        item.url === pathname && "text-destructive"
                      )}
                    >
                      {item.title}
                    </span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

const SidebarHeaderPart = () => {
  return (
    <SidebarHeader className={cn("mb-0.5 mt-2.5 px-0")}>
      <SidebarMenu className='gap-3.5'>
        <SidebarMenuItem className='px-3'>
          <div className='flex items-center gap-2 py-[5px]'>
            <div className='mt-0.5 self-start rounded-sm bg-[#F23553] px-1.5 py-1 text-[8px] font-bold text-white'>
              DMS
            </div>
          </div>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <Separator className='my-2' />
          <SidebarMenuButton
            asChild
            size={"sm"}
            className='hover:bg-transparent my-[11.5px]'
          >
            <Link href={"/"} className=' flex gap-1 pl-6 '>
              {/* <Image
                src={undoIcon.src}
                alt='go back'
                width={20}
                height={20}
                className='size-5'
              /> */}
              <h3 className='text-sm font-medium text-foreground/80'>
                Back to Home
              </h3>
            </Link>
          </SidebarMenuButton>
          <Separator className='mt-2' />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
};
