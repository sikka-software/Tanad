import React from "react";

import { z } from "zod";

import SheetTable from "@/components/ui/sheet-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompaniesStore } from "@/stores/companies.store";
import { Company } from "@/types/company.type";

const nameSchema = z.string().min(1, "Required");
const industrySchema = z.string().optional();
const emailSchema = z.string().email("Invalid email").min(1, "Required");
const phoneSchema = z.string().optional();
const websiteSchema = z.string().url("Invalid URL").optional();
const addressSchema = z.string().optional();
const citySchema = z.string().optional();
const stateSchema = z.string().optional();
const zipCodeSchema = z.string().optional();
const sizeSchema = z.number().min(0, "Must be >= 0").optional();
const isActiveSchema = z.boolean();
const notesSchema = z.string().optional();

const columns = [
  { accessorKey: "name", header: "Name", validationSchema: nameSchema },
  { accessorKey: "industry", header: "Industry", validationSchema: industrySchema },
  { accessorKey: "email", header: "Email", validationSchema: emailSchema },
  { accessorKey: "phone", header: "Phone", validationSchema: phoneSchema },
  { accessorKey: "website", header: "Website", validationSchema: websiteSchema },
  { accessorKey: "address", header: "Address", validationSchema: addressSchema },
  { accessorKey: "city", header: "City", validationSchema: citySchema },
  { accessorKey: "state", header: "State", validationSchema: stateSchema },
  { accessorKey: "zipCode", header: "Zip Code", validationSchema: zipCodeSchema },
  { accessorKey: "size", header: "Size", validationSchema: sizeSchema },
  { accessorKey: "isActive", header: "Status", validationSchema: isActiveSchema },
  { accessorKey: "notes", header: "Notes", validationSchema: notesSchema },
];

interface CompaniesTableProps {
  data: Company[];
  isLoading?: boolean;
  error?: Error | null;
}

const CompaniesTable = ({ data, isLoading, error }: CompaniesTableProps) => {
  const { updateCompany } = useCompaniesStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateCompany(rowId, { [columnId]: value });
  };

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="m-4 mb-0 rounded bg-red-800 p-2 text-center">
        Error loading companies: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default CompaniesTable;
