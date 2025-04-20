import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import useCompanyStore from "@/modules/company/company.store";
import { Company } from "@/modules/company/company.type";

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
  onActionClicked: (action: string, rowId: string) => void;
}

const CompaniesTable = ({ data, isLoading, error, onActionClicked }: CompaniesTableProps) => {
  const t = useTranslations();
  const updateCompany = useCompanyStore((state) => state.updateCompany);
  const selectedRows = useCompanyStore((state) => state.selectedRows);
  const setSelectedRows = useCompanyStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Company>[] = [
    { accessorKey: "name", header: t("Companies.form.name.label"), validationSchema: nameSchema },
    {
      accessorKey: "industry",
      header: t("Companies.form.industry.label"),
      validationSchema: industrySchema,
    },
    {
      accessorKey: "email",
      header: t("Companies.form.email.label"),
      validationSchema: emailSchema,
    },
    {
      accessorKey: "phone",
      header: t("Companies.form.phone.label"),
      validationSchema: phoneSchema,
    },
    {
      accessorKey: "website",
      header: t("Companies.form.website.label"),
      validationSchema: websiteSchema,
    },
    {
      accessorKey: "address",
      header: t("Companies.form.address.label"),
      validationSchema: addressSchema,
    },
    { accessorKey: "city", header: t("Companies.form.city.label"), validationSchema: citySchema },
    {
      accessorKey: "state",
      header: t("Companies.form.state.label"),
      validationSchema: stateSchema,
    },
    {
      accessorKey: "zip_code",
      header: t("Companies.form.zip_code.label"),
      validationSchema: zipCodeSchema,
    },
    { accessorKey: "size", header: t("Companies.form.size.label"), validationSchema: sizeSchema },
    {
      accessorKey: "is_active",
      header: t("Companies.form.is_active.label"),
      validationSchema: is_activeSchema,
    },
    {
      accessorKey: "notes",
      header: t("Companies.form.notes.label"),
      validationSchema: notesSchema,
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateCompany(rowId, { [columnId]: value });
  };

  const handleRowSelectionChange = (rows: Company[]) => {
    const newSelectedIds = rows.map((row) => row.id!);
    // Only update if the selection has actually changed
    const currentSelection = new Set(selectedRows);
    const newSelection = new Set(newSelectedIds);

    if (
      newSelection.size !== currentSelection.size ||
      !Array.from(newSelection).every((id) => currentSelection.has(id))
    ) {
      setSelectedRows(newSelectedIds);
    }
  };

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
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
  };

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={companyTableOptions}
      onActionClicked={onActionClicked}
      texts={{
        actions: t("General.actions"),
        edit: t("General.edit"),
        duplicate: t("General.duplicate"),
        view: t("General.view"),
        archive: t("General.archive"),
        delete: t("General.delete"),
      }}
    />
  );
};

export default CompaniesTable;
