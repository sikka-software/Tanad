import React from "react";

import { useTranslations } from "next-intl";

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
import { useBranchesStore } from "@/stores/branches.store";
import { Branch } from "@/types/branch.type";

const nameSchema = z.string().min(1, "Required");
const codeSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const phoneSchema = z.string().min(1, "Required");
const emailSchema = z.string().email("Invalid email");
const managerSchema = z.string().min(1, "Required");
const notesSchema = z.string().optional();

interface BranchesTableProps {
  data: Branch[];
  isLoading?: boolean;
  error?: Error | null;
}

const BranchesTable = ({ data, isLoading, error }: BranchesTableProps) => {
  const t = useTranslations("Branches");
  const { updateBranch } = useBranchesStore();

  const columns = [
    { accessorKey: "name", header: t("form.name.label"), validationSchema: nameSchema },
    { accessorKey: "code", header: t("form.code.label"), validationSchema: codeSchema },
    { accessorKey: "address", header: t("form.address.label"), validationSchema: addressSchema },
    { accessorKey: "city", header: t("form.city.label"), validationSchema: citySchema },
    { accessorKey: "state", header: t("form.state.label"), validationSchema: stateSchema },
    { accessorKey: "zip_code", header: t("form.zip_code.label"), validationSchema: zipCodeSchema },
    { accessorKey: "phone", header: t("form.phone.label"), validationSchema: phoneSchema },
    { accessorKey: "email", header: t("form.email.label"), validationSchema: emailSchema },
    { accessorKey: "manager", header: t("form.manager.label"), validationSchema: managerSchema },
    { accessorKey: "notes", header: t("form.notes.label"), validationSchema: notesSchema },
    { 
      accessorKey: "is_active", 
      header: t("form.is_active.label"), 
      validationSchema: z.boolean(),
      type: "boolean"
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateBranch(rowId, { [columnId]: value });
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
        {t("error_loading_branches")}: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default BranchesTable; 