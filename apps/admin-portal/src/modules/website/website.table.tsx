import { useLocale, useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useWebsiteColumns from "./website.columns";
import { useUpdateWebsite } from "./website.hooks";
import useWebsiteStore from "./website.store";
import { Website } from "./website.type";

const WebsitesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Website>) => {
  const t = useTranslations();
  const columns = useWebsiteColumns();

  const { mutate: updateWebsite } = useUpdateWebsite();
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

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    const website = data.find((w) => w.id === rowId);
    if (!website) return;

    const updatePayload: Partial<Website> = {
      [columnId as keyof Website]: value as any,
    };

    await updateWebsite({
      id: website.id,
      data: updatePayload,
    });
  };

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
      <TableSkeleton columns={columns.map((column) => column.accessorKey as string)} rows={5} />
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
