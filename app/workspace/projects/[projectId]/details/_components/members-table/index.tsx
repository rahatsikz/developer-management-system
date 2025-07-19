import { DataTable } from "@/components/table/data-table";
import { columns } from "./columns";
import { User } from "@/types/index";

export default function MemberTable({
  data,
  totalData,
}: {
  data: User[];
  totalData: number;
}) {
  // const { searchQuery, setPage, setSearchQuery } = usePropertyTableFilters();

  return (
    <DataTable
      columns={columns}
      data={data}
      totalItems={totalData}
      className='h-fit md:h-fit'
    />
  );
}
