import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateCompany } from "@/company/company.hooks";
import useCompanyStore from "@/company/company.store";
import { Company } from "@/company/company.type";

import useUserStore from "@/stores/use-user-store";

const CompaniesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Company>) => {
  const t = useTranslations();
  const { mutate: updateCompany } = useUpdateCompany();

  const canEditCompany = useUserStore((state) => state.hasPermission("companies.update"));
  const canDuplicateCompany = useUserStore((state) => state.hasPermission("companies.duplicate"));
  const canViewCompany = useUserStore((state) => state.hasPermission("companies.view"));
  const canArchiveCompany = useUserStore((state) => state.hasPermission("companies.archive"));
  const canDeleteCompany = useUserStore((state) => state.hasPermission("companies.delete"));

  const selectedRows = useCompanyStore((state) => state.selectedRows);
  const setSelectedRows = useCompanyStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: t("Companies.form.name.label"),
      validationSchema: z.string().min(1, t("Companies.form.name.required")),
    },
    {
      accessorKey: "industry",
      header: t("Companies.form.industry.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "email",
      header: t("Companies.form.email.label"),
      validationSchema: z.string().email(t("Companies.form.email.invalid")),
    },
    {
      accessorKey: "phone",
      header: t("Companies.form.phone.label"),
      cell: ({ row }) => {
        return <span dir="ltr"> {row.original.phone}</span>;
      },
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "website",
      header: t("Companies.form.website.label"),
      validationSchema: z.string().url(t("Companies.form.website.invalid")),
    },
    {
      accessorKey: "address",
      header: t("Companies.form.address.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "city",
      header: t("Companies.form.city.label"),
      validationSchema: z.string().optional(),
    },

    {
      accessorKey: "state",
      header: t("Companies.form.state.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "zip_code",
      header: t("Companies.form.zip_code.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "size",
      header: t("Companies.form.size.label"),
      validationSchema: z.number().min(0, t("Companies.form.size.invalid")),
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("Companies.form.status.label"),
      validationSchema: z.boolean(),
      cellType: "status",
      options: [
        { value: "active", label: t("Companies.form.status.active") },
        { value: "inactive", label: t("Companies.form.status.inactive") },
      ],
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateCompany({ id: rowId, company: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Company[]) => {
      const newSelectedIds = rows.map((row) => row.id);
      // Only update if the selection has actually changed
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
        setSelectedRows(newSelectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

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
      enableColumnSizing={true}
      canEditAction={canEditCompany}
      canDuplicateAction={canDuplicateCompany}
      canViewAction={canViewCompany}
      canArchiveAction={canArchiveCompany}
      canDeleteAction={canDeleteCompany}
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
