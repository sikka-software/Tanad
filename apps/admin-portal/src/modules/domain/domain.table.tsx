import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useDomainColumns from "./domain.columns";
import { useUpdateDomain } from "./domain.hooks";
import useDomainStore from "./domain.store";
import { Domain } from "./domain.type";

const DomainsTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Domain>) => {
  const t = useTranslations();
  const { mutate: updateDomain } = useUpdateDomain();
  const setData = useDomainStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateDomain({ id: rowId, data: { [columnId]: value } });
  };
  const columns = useDomainColumns(handleEdit);

  const selectedRows = useDomainStore((state) => state.selectedRows);
  const setSelectedRows = useDomainStore((state) => state.setSelectedRows);

  const columnVisibility = useDomainStore((state) => state.columnVisibility);
  const setColumnVisibility = useDomainStore((state) => state.setColumnVisibility);

  const canEditDomain = useUserStore((state) => state.hasPermission("domains.update"));
  const canDuplicateDomain = useUserStore((state) => state.hasPermission("domains.duplicate"));
  const canViewDomain = useUserStore((state) => state.hasPermission("domains.view"));
  const canArchiveDomain = useUserStore((state) => state.hasPermission("domains.archive"));
  const canDeleteDomain = useUserStore((state) => state.hasPermission("domains.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Domain[]) => {
      const newSelectedIds = rows.map((row) => row.id);
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

  const domainTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Domain) => row.id,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id]);
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
      canEditAction={canEditDomain}
      canDuplicateAction={canDuplicateDomain}
      canViewAction={canViewDomain}
      canArchiveAction={canArchiveDomain}
      canDeleteAction={canDeleteDomain}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={domainTableOptions}
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

export default DomainsTable;
