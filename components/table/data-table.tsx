"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { usePagination } from "@/hooks/use-pagination";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/utils";
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems: number;
  pageSizeOptions?: number[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  ...props
}: DataTableProps<TData, TValue> & React.HTMLAttributes<HTMLTableElement>) {
  // const { page, setPage, limit, setLimit } = usePagination();
  const {
    state: { page, limit },
    setState,
  } = useUrlState(["page", "limit"], {
    page: "1",
    limit: "10",
  });

  const paginationState = {
    pageIndex: Number(page) - 1, // zero-based index for React Table
    pageSize: Number(limit),
  };

  const pageCount = Math.ceil(totalItems / Number(limit));

  const handlePaginationChange = (
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState)
  ) => {
    const pagination =
      typeof updaterOrValue === "function"
        ? updaterOrValue(paginationState)
        : updaterOrValue;

    // setPage(pagination.pageIndex + 1); // converting zero-based index to one-based
    // setLimit(pagination.pageSize);

    setState({
      page: String(pagination.pageIndex + 1),
      limit: String(pagination.pageSize),
    });
  };

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      pagination: paginationState,
    },
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  return (
    <div className='space-y-4'>
      <ScrollArea
        className={cn(
          "h-[calc(80vh-220px)] rounded-lg border md:h-[calc(90dvh-240px)] max-lg:w-[calc(100dvw-25px)]",
          props.className
        )}
      >
        <div className='w-full overflow-x-auto'>
          <Table className=' relative min-w-[700px]'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className='bg-secondary px-6 py-4 text-foreground [&:nth-child(2)]:pl-0 [&:nth-child(2)]:min-w-0 min-w-0'
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className='px-6 [&:nth-child(2)]:min-w-0 [&:nth-child(2)]:px-0'
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>

      <div className='flex flex-col items-center justify-end gap-6 space-x-2 py-4 lg:flex-row px-2 '>
        <div className='flex w-full flex-col items-center justify-between gap-4 md:flex-row '>
          <div className='flex-1 text-sm text-muted-foreground'>
            {totalItems > 0 ? (
              <>
                Showing{" "}
                {paginationState.pageIndex * paginationState.pageSize + 1} to{" "}
                {Math.min(
                  (paginationState.pageIndex + 1) * paginationState.pageSize,
                  totalItems
                )}{" "}
                of {totalItems} entries
              </>
            ) : (
              "No entries found"
            )}
          </div>
          <div className='flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8  '>
            <div className='flex items-center space-x-2'>
              <p className='whitespace-nowrap text-sm font-medium'>
                Rows per page
              </p>
              <Select
                value={`${paginationState.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className='h-8 w-[70px]'>
                  <SelectValue placeholder={paginationState.pageSize} />
                </SelectTrigger>
                <SelectContent side='bottom'>
                  {pageSizeOptions.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className='flex w-full items-center justify-center gap-2 md:justify-end'>
          <div className='flex items-center justify-center text-sm font-medium lg:w-[150px]'>
            {totalItems > 0 ? (
              <>
                Page {paginationState.pageIndex + 1} of {table.getPageCount()}
              </>
            ) : (
              "No pages"
            )}
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              aria-label='Go to first page'
              variant='outline'
              className='hidden h-8 w-8 p-0 lg:flex'
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <DoubleArrowLeftIcon className='h-4 w-4' aria-hidden='true' />
            </Button>
            <Button
              aria-label='Go to previous page'
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className='h-4 w-4' aria-hidden='true' />
            </Button>
            <Button
              aria-label='Go to next page'
              variant='outline'
              className='h-8 w-8 p-0'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className='h-4 w-4' aria-hidden='true' />
            </Button>
            <Button
              aria-label='Go to last page'
              variant='outline'
              className='hidden h-8 w-8 p-0 lg:flex'
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <DoubleArrowRightIcon className='h-4 w-4' aria-hidden='true' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
