"use client";
import { useGetMyCompanies } from "@/api/company.query";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/use-auth-store";
import { Company } from "@/types";
import { format } from "date-fns";
import { Building2, FolderKanban, Loader2, Users } from "lucide-react";
import Link from "next/link";

export default function CompanyList() {
  const { user } = useAuthStore((state) => state);
  const { data, isFetching } = useGetMyCompanies(user?.id ?? "");

  if (isFetching)
    return (
      <div className='flex items-center gap-2'>
        <Loader2 className='animate-spin size-4' />
        <span>Loading...</span>
      </div>
    );
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
      {data?.data?.map((company: Company) => (
        <CompanyCard key={company.id} {...{ company }} />
      ))}
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <Link href={`/workspace/company/${company.id}/details`}>
      <Card className='overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary'>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 capitalize'>
            <Building2 className='h-5 w-5 text-muted-foreground' />
            {company.name}
          </CardTitle>
          <CardDescription>
            Created on {format(company.createdAt, "PP")}
          </CardDescription>
        </CardHeader>
        <CardContent className='pb-2'>
          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1.5'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <span>{company.users.length || 0} users</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <FolderKanban className='h-4 w-4 text-muted-foreground' />
              <span>{company?.projects?.length || 0} projects</span>
            </div>
          </div>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </Link>
  );
}
