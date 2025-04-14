import React from "react";

import { useTranslations } from "next-intl";

import { z } from "zod";

import ErrorComponent from "@/components/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/components/ui/sheet-table";
import TableSkeleton from "@/components/ui/table-skeleton";
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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateVendor(rowId, { [columnId]: value });
  };

  const columns: ExtendedColumnDef<Vendor>[] = [
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

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
    );
  }
  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default VendorsTable;
