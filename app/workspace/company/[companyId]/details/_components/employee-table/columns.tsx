import { User } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

export const columns: ColumnDef<User>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => (
      <p className='capitalize min-h-9 flex items-center'>
        {row.original.name ?? "N/A"}
      </p>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <p className=''>{row.original.email ?? "N/A"}</p>,
  },
  {
    id: "createdAt",
    header: "Joined At",
    cell: ({ row }) => (
      <p className='capitalize min-h-9 flex items-center'>
        {format(new Date(row.original.createdAt), "PP")}
      </p>
    ),
  },

  //   {
  //     id: "actions",
  //     header: "Actions",
  //     cell: ({ row }) => <CellAction data={row.original} />,
  //   },
];
