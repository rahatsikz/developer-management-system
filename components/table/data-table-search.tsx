"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import React, { useTransition } from "react";
import { Button } from "../ui/button";

interface DataTableSearchProps {
  searchKey: string;
  searchQuery: string;
  setSearchQuery: (
    value: string | ((old: string) => string | null) | null,
    options?: any
  ) => Promise<URLSearchParams>;
  setPage: (
    value: number | ((old: number) => number | null) | null,
    options?: any
  ) => Promise<URLSearchParams>;
}

export function DataTableSearch({
  searchKey,
  searchQuery,
  setSearchQuery,
  // setPage,
  ...props
}: DataTableSearchProps & React.HTMLAttributes<HTMLInputElement>) {
  const [isLoading, startTransition] = useTransition();

  /*  const handleSearch = (value: string) => {
    setSearchQuery(value, { startTransition });
    setPage(1); // Reset page to 1 when search changes
  }; */

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    if (!search.length) return;
    setSearchQuery(search, { startTransition }).catch(console.error);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex w-72 items-center gap-2 rounded-full border border-input focus:ring-1 focus:ring-ring md:max-w-xl'
    >
      <div className='relative'>
        <Search className='absolute left-4 top-1/2 size-4 -translate-y-1/2 transform text-muted-foreground' />
        <input
          placeholder={`Search by ${searchKey}`}
          defaultValue={searchQuery ?? ""}
          // onChange={(e) => handleSearch(e.target.value)}
          name='search'
          className={cn(
            "w-full border-0 pb-1.5 pl-11 shadow-none focus-visible:ring-0 md:max-w-sm",
            isLoading && "animate-pulse",
            props.className
          )}
          autoComplete='off'
        />
      </div>
      <Button
        type='submit'
        variant={"secondary"}
        size={"sm"}
        className='h-10 rounded-e-full px-5 font-bold'
      >
        Search
      </Button>
    </form>
  );
}
