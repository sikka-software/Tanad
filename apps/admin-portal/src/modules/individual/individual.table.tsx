import { useTranslations } from "next-intl";
import { useCallback } from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { createHandleEdit } from "@/utils/module-utils";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateIndividual } from "@/individual/individual.hooks";
import useIndividualStore from "@/individual/individual.store";
import { Individual, IndividualUpdateData } from "@/individual/individual.type";
import useUserStore from "@/stores/use-user-store";

import useIndividualColumns from "./individual.columns";

const IndividualsTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<Individual>) => {
  const t = useTranslations();

  const setData = useIndividualStore((state) => state.setData);

  const { mutate: updateIndividual } = useUpdateIndividual();
  const handleEdit = createHandleEdit<Individual, IndividualUpdateData>(
    setData,
    updateIndividual,
    data,
  );

  const columns = useIndividualColumns(handleEdit);

  const selectedRows = useIndividualStore((state) => state.selectedRows);
  const setSelectedRows = useIndividualStore((state) => state.setSelectedRows);

  const columnVisibility = useIndividualStore((state) => state.columnVisibility);
  const setColumnVisibility = useIndividualStore((state) => state.setColumnVisibility);

  const canEditIndividual = useUserStore((state) => state.hasPermission("individuals.update"));
  const canDuplicateIndividual = useUserStore((state) =>
    state.hasPermission("individuals.duplicate"),
  );
  const canViewIndividual = useUserStore((state) => state.hasPermission("individuals.view"));
  const canArchiveIndividual = useUserStore((state) => state.hasPermission("individuals.archive"));
  const canDeleteIndividual = useUserStore((state) => state.hasPermission("individuals.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = useCallback(
    (rows: Individual[]) => {
      const newSelectedIds = rows.map((row: Individual) => row.id!);
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

  const individualTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Individual) => row.id!,
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater;
      const selectedRows = data.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
  };

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      enableColumnSizing={true}
      canEditAction={canEditIndividual}
      canDuplicateAction={canDuplicateIndividual}
      canViewAction={canViewIndividual}
      canArchiveAction={canArchiveIndividual}
      canDeleteAction={canDeleteIndividual}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={individualTableOptions}
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

export default IndividualsTable;
