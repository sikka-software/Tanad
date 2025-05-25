import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { createHandleEdit } from "@/utils/module-utils";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useWebsiteColumns from "./website.columns";
import { useUpdateWebsite } from "./website.hooks";
import useWebsiteStore from "./website.store";
import { Website, WebsiteUpdateData } from "./website.type";

const WebsitesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Website>) => {
  const t = useTranslations();

  const { mutate: updateWebsite } = useUpdateWebsite();
  const setData = useWebsiteStore((state) => state.setData);

  const handleEdit = createHandleEdit<Website, WebsiteUpdateData>(setData, updateWebsite, data);

  const columns = useWebsiteColumns(handleEdit);
  const selectedRows = useWebsiteStore((state: any) => state.selectedRows);
  const setSelectedRows = useWebsiteStore((state: any) => state.setSelectedRows);

  const columnVisibility = useWebsiteStore((state) => state.columnVisibility);
  const setColumnVisibility = useWebsiteStore((state) => state.setColumnVisibility);

  const canEditWebsite = useUserStore((state) => state.hasPermission("websites.update"));
  const canDuplicateWebsite = useUserStore((state) => state.hasPermission("websites.duplicate"));
  const canViewWebsite = useUserStore((state) => state.hasPermission("websites.view"));
  const canArchiveWebsite = useUserStore((state) => state.hasPermission("websites.archive"));
  const canDeleteWebsite = useUserStore((state) => state.hasPermission("websites.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id: string) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (currentlySelectedItems: Website[]) => {
      const newSelectedIds = currentlySelectedItems.map((item) => item.id);
      if (JSON.stringify(newSelectedIds.sort()) !== JSON.stringify(selectedRows.sort())) {
        setSelectedRows(newSelectedIds);
      }
    },
    [selectedRows, setSelectedRows],
  );

  if (isLoading) {
    return (
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={12} />
    );
  }

  if (error) {
    return (
      <ErrorComponent
        errorMessage={typeof error === "string" ? error : t("General.error_loading_data")}
      />
    );
  }

  const websiteTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Website) => row.id,
    onRowSelectionChange: (updater: any) => {
      const newSelectionState = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedIds = Object.keys(newSelectionState).filter((id) => newSelectionState[id]);
      const selectedItems = data.filter((item) => selectedIds.includes(item.id));
      handleRowSelectionChange(selectedItems);
    },
  };

  return (
    <SheetTable<Website>
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      enableColumnSizing={true}
      canEditAction={canEditWebsite}
      canDuplicateAction={canDuplicateWebsite}
      canViewAction={canViewWebsite}
      canArchiveAction={canArchiveWebsite}
      canDeleteAction={canDeleteWebsite}
      tableOptions={websiteTableOptions}
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

export default WebsitesTable;
