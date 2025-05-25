import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { createHandleEdit } from "@/utils/module-utils";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import useDocumentColumns from "./document.columns";
import { useUpdateDocument } from "./document.hooks";
import useDocumentStore from "./document.store";
import { Document, DocumentUpdateData } from "./document.type";

const DocumentsTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<Document>) => {
  const t = useTranslations();

  const { mutate: updateDocument } = useUpdateDocument();

  const setData = useDocumentStore((state) => state.setData);

  const handleEdit = createHandleEdit<Document, DocumentUpdateData>(setData, updateDocument, data);

  const columns = useDocumentColumns(handleEdit);

  const selectedRows = useDocumentStore((state) => state.selectedRows);
  const setSelectedRows = useDocumentStore((state) => state.setSelectedRows);

  const columnVisibility = useDocumentStore((state) => state.columnVisibility);
  const setColumnVisibility = useDocumentStore((state) => state.setColumnVisibility);

  const canEditDocument = useUserStore((state) => state.hasPermission("documents.update"));
  const canDuplicateDocument = useUserStore((state) => state.hasPermission("documents.duplicate"));
  const canViewDocument = useUserStore((state) => state.hasPermission("documents.view"));
  const canArchiveDocument = useUserStore((state) => state.hasPermission("documents.archive"));
  const canDeleteDocument = useUserStore((state) => state.hasPermission("documents.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Document[]) => {
      const newSelectedIds = rows.map((row) => row.id);
      if (JSON.stringify(newSelectedIds) !== JSON.stringify(selectedRows)) {
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
    return <ErrorComponent errorMessage={error.message} />;
  }

  const documentTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Document) => row.id,
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
      canEditAction={canEditDocument}
      canDuplicateAction={canDuplicateDocument}
      canViewAction={canViewDocument}
      canArchiveAction={canArchiveDocument}
      canDeleteAction={canDeleteDocument}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={documentTableOptions}
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

export default DocumentsTable;
