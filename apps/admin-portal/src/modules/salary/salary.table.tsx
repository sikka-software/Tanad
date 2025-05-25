import { useTranslations } from "next-intl";
import React from "react";

import ErrorComponent from "@/ui/error-component";
import SheetTable from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { createHandleEdit } from "@/utils/module-utils";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateSalary } from "@/salary/salary.hooks";
import useSalaryStore from "@/salary/salary.store";
import { Salary, SalaryUpdateData } from "@/salary/salary.type";

import useUserStore from "@/stores/use-user-store";

import useSalaryColumns from "./salary.columns";

const SalariesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Salary>) => {
  const t = useTranslations();
  const { mutate: updateSalary } = useUpdateSalary();
  const setData = useSalaryStore((state) => state.setData);

  const handleEdit = createHandleEdit<Salary, SalaryUpdateData>(setData, updateSalary, data);

  const columns = useSalaryColumns(handleEdit);

  const selectedRows = useSalaryStore((state) => state.selectedRows);
  const setSelectedRows = useSalaryStore((state) => state.setSelectedRows);
  const columnVisibility = useSalaryStore((state) => state.columnVisibility);
  const setColumnVisibility = useSalaryStore((state) => state.setColumnVisibility);

  const canEditSalary = useUserStore((state) => state.hasPermission("salaries.update"));
  const canDuplicateSalary = useUserStore((state) => state.hasPermission("salaries.duplicate"));
  const canViewSalary = useUserStore((state) => state.hasPermission("salaries.view"));
  const canArchiveSalary = useUserStore((state) => state.hasPermission("salaries.archive"));
  const canDeleteSalary = useUserStore((state) => state.hasPermission("salaries.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleRowSelectionChange = (rows: Salary[]) => {
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
      <TableSkeleton
        columns={columns
          .map((col) => col.accessorKey || col.id)
          .filter((key): key is string => !!key)}
        rows={12}
      />
    );
  }

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  const salaryTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Salary) => row.id!,
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
      canEditAction={canEditSalary}
      canDuplicateAction={canDuplicateSalary}
      canViewAction={canViewSalary}
      canArchiveAction={canArchiveSalary}
      canDeleteAction={canDeleteSalary}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={salaryTableOptions}
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

export default SalariesTable;
