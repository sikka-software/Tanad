import { useLocale, useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import { ComboboxAdd } from "@/ui/comboboxes/combobox-add";
import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateOffice } from "@/office/office.hooks";
import useOfficeStore from "@/office/office.store";
import { Office } from "@/office/office.type";

import { useEmployees } from "@/employee/employee.hooks";

import useUserStore from "@/stores/use-user-store";

const OfficesTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Office>) => {
  const t = useTranslations();
  const locale = useLocale();
  const { mutate: updateOffice } = useUpdateOffice();

  const setData = useOfficeStore((state) => state.setData);
  const selectedRows = useOfficeStore((state) => state.selectedRows);
  const setSelectedRows = useOfficeStore((state) => state.setSelectedRows);

  const columnVisibility = useOfficeStore((state) => state.columnVisibility);
  const setColumnVisibility = useOfficeStore((state) => state.setColumnVisibility);

  const canEditOffice = useUserStore((state) => state.hasPermission("offices.update"));
  const canDuplicateOffice = useUserStore((state) => state.hasPermission("offices.duplicate"));
  const canViewOffice = useUserStore((state) => state.hasPermission("offices.view"));
  const canArchiveOffice = useUserStore((state) => state.hasPermission("offices.archive"));
  const canDeleteOffice = useUserStore((state) => state.hasPermission("offices.delete"));

  // Employees for manager combobox
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const handleEdit = (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "office_id") return;
    // Optimistically update the store's data
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    // Then call the API (fire and forget)
    updateOffice({ id: rowId, office: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Office[]) => {
      const newSelectedIds = rows.map((row) => row.id!);
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

  const officeTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Office) => row.id!,
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
      canEditAction={canEditOffice}
      canDuplicateAction={canDuplicateOffice}
      canViewAction={canViewOffice}
      canArchiveAction={canArchiveOffice}
      canDeleteAction={canDeleteOffice}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={officeTableOptions}
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

export default OfficesTable;
