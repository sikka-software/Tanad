import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { Company } from "@/types/company.type";

import useCompaniesStore from "@/stores/companies.store";

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
const is_activeSchema = z.boolean();
const notesSchema = z.string().optional();

interface CompaniesTableProps {
  data: Company[];
  isLoading?: boolean;
  error?: Error | null;
}

const CompaniesTable = ({ data, isLoading, error }: CompaniesTableProps) => {
  const t = useTranslations("Companies");
  const { updateCompany, selectedRows, setSelectedRows } = useCompaniesStore();

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateCompany(rowId, { [columnId]: value });
  };

  const handleRowSelectionChange = useCallback(
    (selectedRows: Company[]) => {
      const selectedIds = selectedRows.map((row) => row.id!);
      if (JSON.stringify(selectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(selectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  const handleRowSelectionUpdater = useCallback(
    (
      updater:
        | ((old: Record<string, boolean>) => Record<string, boolean>)
        | Record<string, boolean>,
    ) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
    [data, rowSelection, handleRowSelectionChange],
  );

  const columns: ExtendedColumnDef<Company>[] = [
    { accessorKey: "name", header: t("form.name.label"), validationSchema: nameSchema },
    { accessorKey: "industry", header: t("form.industry.label"), validationSchema: industrySchema },
    { accessorKey: "email", header: t("form.email.label"), validationSchema: emailSchema },
    { accessorKey: "phone", header: t("form.phone.label"), validationSchema: phoneSchema },
    { accessorKey: "website", header: t("form.website.label"), validationSchema: websiteSchema },
    { accessorKey: "address", header: t("form.address.label"), validationSchema: addressSchema },
    { accessorKey: "city", header: t("form.city.label"), validationSchema: citySchema },
    { accessorKey: "state", header: t("form.state.label"), validationSchema: stateSchema },
    { accessorKey: "zipCode", header: t("form.zip_code.label"), validationSchema: zipCodeSchema },
    { accessorKey: "size", header: t("form.size.label"), validationSchema: sizeSchema },
    {
      accessorKey: "is_active",
      header: t("form.is_active.label"),
      validationSchema: is_activeSchema,
    },
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

  const companyTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Company) => row.id!,
    onRowSelectionChange: handleRowSelectionUpdater,
  };

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={companyTableOptions}
    />
  );
};

export default CompaniesTable;
