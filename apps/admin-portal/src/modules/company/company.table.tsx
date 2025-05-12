import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateCompany } from "@/company/company.hooks";
import useCompanyStore from "@/company/company.store";
import { Company } from "@/company/company.type";

import useUserStore from "@/stores/use-user-store";

import useCompanyColumns from "./company.columns";

const CompaniesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Company>) => {
  const t = useTranslations();
  const setData = useCompanyStore((state) => state.setData);
  const { mutate: updateCompany } = useUpdateCompany();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateCompany({ id: rowId, data: { [columnId]: value } });
  };
  const columns = useCompanyColumns(handleEdit);

  const columnVisibility = useCompanyStore((state) => state.columnVisibility);
  const setColumnVisibility = useCompanyStore((state) => state.setColumnVisibility);

  const canEditCompany = useUserStore((state) => state.hasPermission("companies.update"));
  const canDuplicateCompany = useUserStore((state) => state.hasPermission("companies.duplicate"));
  const canViewCompany = useUserStore((state) => state.hasPermission("companies.view"));
  const canArchiveCompany = useUserStore((state) => state.hasPermission("companies.archive"));
  const canDeleteCompany = useUserStore((state) => state.hasPermission("companies.delete"));

  const selectedRows = useCompanyStore((state) => state.selectedRows);
  const setSelectedRows = useCompanyStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

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
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={setColumnVisibility}
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
