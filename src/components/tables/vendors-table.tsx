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
import { useVendorsStore } from "@/stores/vendors.store";
import { Vendor } from "@/types/vendor.type";

const nameSchema = z.string().min(1, "Required");
const companySchema = z.string().optional();
const emailSchema = z.string().email("Invalid email").min(1, "Required");
const phoneSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const productsSchema = z.string().optional();
const notesSchema = z.string().optional();

interface VendorsTableProps {
  data: Vendor[];
  isLoading?: boolean;
  error?: Error | null;
}

const VendorsTable = ({ data, isLoading, error }: VendorsTableProps) => {
  const t = useTranslations("Vendors");
  const { updateVendor } = useVendorsStore();

  const columns = [
    { accessorKey: "name", header: t("form.name.label"), validationSchema: nameSchema },
    { accessorKey: "company", header: t("form.company.label"), validationSchema: companySchema },
    { accessorKey: "email", header: t("form.email.label"), validationSchema: emailSchema },
    { accessorKey: "phone", header: t("form.phone.label"), validationSchema: phoneSchema },
    { accessorKey: "address", header: t("form.address.label"), validationSchema: addressSchema },
    { accessorKey: "city", header: t("form.city.label"), validationSchema: citySchema },
    { accessorKey: "state", header: t("form.state.label"), validationSchema: stateSchema },
    { accessorKey: "zipCode", header: t("form.zip_code.label"), validationSchema: zipCodeSchema },
    { accessorKey: "products", header: t("form.products.label"), validationSchema: productsSchema },
    { accessorKey: "notes", header: t("form.notes.label"), validationSchema: notesSchema },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateVendor(rowId, { [columnId]: value });
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
        {t("error.create")}: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default VendorsTable; 