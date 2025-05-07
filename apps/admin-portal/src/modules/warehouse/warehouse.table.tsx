import { ComboboxAdd } from "@root/src/components/ui/combobox-add";
import { CommandSelect } from "@root/src/components/ui/command-select";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateWarehouse } from "@/warehouse/warehouse.hooks";
import useWarehouseStore from "@/warehouse/warehouse.store";
import { Warehouse } from "@/warehouse/warehouse.type";

import useUserStore from "@/stores/use-user-store";

import { useEmployees } from "../employee/employee.hooks";

const WarehouseTable = ({
  data,
  isLoading,
  error,
  onActionClicked,
}: ModuleTableProps<Warehouse>) => {
  const t = useTranslations();
  const locale = useLocale();
  const { mutateAsync: updateWarehouse } = useUpdateWarehouse();
  const selectedRows = useWarehouseStore((state) => state.selectedRows);
  const setSelectedRows = useWarehouseStore((state) => state.setSelectedRows);

  const canEditWarehouse = useUserStore((state) => state.hasPermission("warehouses.update"));
  const canDuplicateWarehouse = useUserStore((state) =>
    state.hasPermission("warehouses.duplicate"),
  );
  const canViewWarehouse = useUserStore((state) => state.hasPermission("warehouses.view"));
  const canArchiveWarehouse = useUserStore((state) => state.hasPermission("warehouses.archive"));
  const canDeleteWarehouse = useUserStore((state) => state.hasPermission("warehouses.delete"));

  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const employeeOptions = employees.map((emp) => ({
    label: `${emp.first_name} ${emp.last_name}`,
    value: emp.id,
  }));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Warehouse>[] = [
    {
      accessorKey: "name",
      header: t("Warehouses.form.name.label"),
      validationSchema: z.string().min(1, t("Warehouses.form.name.required")),
    },
    {
      accessorKey: "code",
      header: t("Warehouses.form.code.label"),
      validationSchema: z.string().min(1, t("Warehouses.form.code.required")),
    },
    {
      accessorKey: "email",
      header: t("Warehouses.form.email.label"),
      validationSchema: z.string().email(t("Warehouses.form.email.invalid")),
    },
    {
      accessorKey: "phone",
      header: t("Warehouses.form.phone.label"),
      validationSchema: z.string().nullable(),
    },
    {
      accessorKey: "capacity",
      header: t("Warehouses.form.capacity.label"),
      validationSchema: z.number().min(0, t("Warehouses.form.capacity.invalid")),
    },

    {
      accessorKey: "manager",
      header: t("Warehouses.form.manager.label"),
      noPadding: true,
      validationSchema: z.string().nullable(),
      cell: ({ row }) => {
        const warehouse = row.original;
        return (
          <ComboboxAdd
            direction={locale === "ar" ? "rtl" : "ltr"}
            inCell
            data={employeeOptions}
            isLoading={employeesLoading}
            buttonClassName="bg-transparent"
            defaultValue={warehouse.manager || ""}
            onChange={async (value) => {
              await updateWarehouse({
                id: warehouse.id,
                data: {
                  manager: value || null,
                },
              });
            }}
            texts={{
              placeholder: ". . .",
              searchPlaceholder: t("Employees.search_employees"),
              noItems: t("Warehouses.form.manager.no_employees"),
            }}
            addText={t("Employees.add_new")}
            ariaInvalid={false}
          />
        );
      },
    },

    {
      accessorKey: "city",
      header: t("Warehouses.form.city.label"),
      validationSchema: z.string().min(1, t("Warehouses.form.city.required")),
    },
    {
      accessorKey: "state",
      header: t("Warehouses.form.state.label"),
      validationSchema: z.string().min(1, t("Warehouses.form.state.required")),
    },
    {
      accessorKey: "zip_code",
      header: t("Warehouses.form.zip_code.label"),
      validationSchema: z.string().min(1, t("Warehouses.form.zip_code.required")),
    },
    {
      accessorKey: "notes",
      header: t("Warehouses.form.notes.label"),
      validationSchema: z.string().optional(),
    },
    {
      accessorKey: "status",
      header: t("Warehouses.form.status.label"),
      validationSchema: z.enum(["active", "inactive"]),
      cellType: "status",
      options: [
        { label: t("Warehouses.form.status.active"), value: "active" },
        { label: t("Warehouses.form.status.inactive"), value: "inactive" },
      ],
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateWarehouse({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = (rows: Warehouse[]) => {
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

  const warehouseTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Warehouse) => row.id!,
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
      canEditAction={canEditWarehouse}
      canDuplicateAction={canDuplicateWarehouse}
      canViewAction={canViewWarehouse}
      canArchiveAction={canArchiveWarehouse}
      canDeleteAction={canDeleteWarehouse}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={warehouseTableOptions}
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

export default WarehouseTable;
