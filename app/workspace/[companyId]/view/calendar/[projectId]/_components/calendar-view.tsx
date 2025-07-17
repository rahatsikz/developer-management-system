"use client";
import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// import { DateDetails } from "./date-details";
// import type { Booking } from "@/types";
import { useMediaQuery } from "@/hooks/use-media-query";
import { dummyTaskList } from "@/constant";
import Card from "./task-details";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const isLargeDevice = useMediaQuery("(min-width: 1024px)");

  // Filter bookings based on search query and type
  //   const filteredBookings = bookingData.filter((booking) => {
  //     const matchesSearch =
  //       searchQuery === "" ||
  //       booking.property.title.toLowerCase().includes(searchQuery.toLowerCase());

  //     return matchesSearch;
  //   });

  const groupedTaskList = dummyTaskList.reduce((acc: any, task: any) => {
    const date = format(task.dueDate, "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {});

  console.log(groupedTaskList["2025-05-01"]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsSheetOpen(true);
  };

  //   const getBookingsForDate = (date: Date) => {
  //     return filteredBookings.filter((booking) => {
  //       const chekcInTime = booking.checkInDate.split("T")[0];
  //       const checkIn = parseISO(chekcInTime ?? "");
  //       const checkOut = booking.checkOutDate
  //         ? parseISO(booking.checkOutDate)
  //         : checkIn;

  //       return isWithinInterval(date, {
  //         start: checkIn,
  //         end: checkOut,
  //       });
  //     });
  //   };

  // Generate days for the current month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add days from previous and next month to fill the calendar grid
  const startDay = monthStart.getDay();
  const endDay = monthEnd.getDay();

  // Previous month days
  const prevMonthDays =
    startDay > 0
      ? eachDayOfInterval({
          start: new Date(
            monthStart.getFullYear(),
            monthStart.getMonth(),
            -startDay + 1
          ),
          end: new Date(monthStart.getFullYear(), monthStart.getMonth(), 0),
        })
      : [];

  // Next month days
  const nextMonthDays =
    endDay < 6
      ? eachDayOfInterval({
          start: new Date(monthEnd.getFullYear(), monthEnd.getMonth() + 1, 1),
          end: new Date(
            monthEnd.getFullYear(),
            monthEnd.getMonth() + 1,
            6 - endDay
          ),
        })
      : [];

  const allDays = [...prevMonthDays, ...days, ...nextMonthDays];

  // Group days into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  return (
    <div className='flex h-[calc(100dvh-175px)] flex-col lg:h-[calc(100dvh-175px)]'>
      {/* Calendar Filter */}
      <div className='mb-5 flex flex-wrap items-center justify-between gap-3 max-lg:pl-1 lg:mt-0'>
        <div className='flex items-center gap-2 max-lg:flex-row-reverse'>
          <Button variant='outline' onClick={handleToday} className='h-9'>
            Today
          </Button>
          <div className='flex items-center rounded-md border border-muted-foreground/20'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handlePreviousMonth}
              className='h-8 py-1'
            >
              <ChevronLeft className='size-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              onClick={handleNextMonth}
              className='h-8 py-1'
            >
              <ChevronRight className='size-4' />
            </Button>
          </div>
          <div className='text-xl font-semibold lg:pl-2'>
            {format(currentDate, "MMMM yyyy")}
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          {/* <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search...'
              className='h-9 w-[250px] border-muted-foreground/20 pl-8'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div> */}
        </div>
      </div>

      {/* Calendar header */}
      <div className='flex-1'>
        <div className='grid grid-cols-7 rounded-t-md border-l border-r border-t border-muted-foreground/20'>
          {[
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ].map((day, index) => (
            <div
              key={day}
              className={cn(
                "border-b border-muted-foreground/20 p-2 text-center font-medium",
                index < 6 && "border-r"
              )}
            >
              {!isLargeDevice ? day.slice(0, 3) : day}
            </div>
          ))}
        </div>

        <div className='grid h-full grid-cols-7 rounded-b-md border-b border-l border-r border-muted-foreground/20'>
          {weeks.map((week, weekIndex) =>
            week.map((day, dayIndex) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              //   const dayBookings = getBookingsForDate(day);
              //   const hasBookings = dayBookings.length > 0;
              //   const isSelected = selectedDate
              //     ? isSameDay(day, selectedDate)
              //     : false;
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    "relative border-b border-muted-foreground/20 p-1 lg:min-h-[200px]",
                    isCurrentMonth
                      ? "bg-muted/30"
                      : "bg-muted-foreground/10 text-muted-foreground",
                    dayIndex < 6 && "border-r",
                    weekIndex === weeks.length - 1 && "border-b-0",
                    groupedTaskList[format(day, "yyyy-MM-dd")]?.length > 0 &&
                      "bg-background cursor-pointer hover:bg-muted/30"
                  )}
                  onClick={() => handleDateClick(day)}
                >
                  <div
                    className={cn(
                      "absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-base font-medium",
                      //   hasBookings && "bg-primary/70 text-background",
                      isToday && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  <div className='px-2 space-y-2 mt-[56px] hidden md:block'>
                    {groupedTaskList[format(day, "yyyy-MM-dd")]
                      ?.slice(0, 2)
                      .map((task: any) => (
                        <div
                          key={task.id}
                          className={cn(
                            "truncate rounded-full bg-muted/70 px-2.5 py-2 text-center text-sm font-medium text-foreground"
                          )}
                        >
                          {task.name}
                        </div>
                      ))}
                    {groupedTaskList[format(day, "yyyy-MM-dd")]?.length > 2 && (
                      <div className='rounded-full bg-muted/70 px-2 py-2 text-center text-sm font-medium text-foreground'>
                        +
                        {groupedTaskList[format(day, "yyyy-MM-dd")]?.length - 1}{" "}
                        more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Date Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side='right'
          className='lg:right-4 top-[118px] md:top-[125px] lg:top-[76px] lg:bottom-1 h-auto rounded-e-xl w-full'
        >
          <SheetHeader>
            <SheetTitle className='text-left'>
              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
            </SheetTitle>
          </SheetHeader>
          {
            <div className='space-y-4 mt-5'>
              {selectedDate &&
                groupedTaskList[format(selectedDate, "yyyy-MM-dd")]?.map(
                  (task: any) => <Card key={task.id} task={task} />
                )}
            </div>
          }
          {/* {selectedDate && (
            <DateDetails bookings={getBookingsForDate(selectedDate)} />
          )} */}
        </SheetContent>
      </Sheet>
    </div>
  );
}
