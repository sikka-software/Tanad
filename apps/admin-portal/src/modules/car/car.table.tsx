import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import CurrencyCell from "@/components/tables/currency-cell";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useUpdateCar } from "./car.hooks";
import useCarStore from "./car.store";
import { Car } from "./car.type";

const CarsTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Car>) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);
  const { mutate: updateCar } = useUpdateCar();
  const selectedRows = useCarStore((state) => state.selectedRows);
  const setSelectedRows = useCarStore((state) => state.setSelectedRows);

  const setData = useCarStore((state) => state.setData);

  const canEditCar = useUserStore((state) => state.hasPermission("cars.update"));
  const canDuplicateCar = useUserStore((state) => state.hasPermission("cars.duplicate"));
  const canViewCar = useUserStore((state) => state.hasPermission("cars.view"));
  const canArchiveCar = useUserStore((state) => state.hasPermission("cars.archive"));
  const canDeleteCar = useUserStore((state) => state.hasPermission("cars.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Car>[] = [
    {
      accessorKey: "name",
      header: t("Cars.form.name.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "code",
      header: t("Cars.form.code.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "make",
      header: t("Cars.form.make.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "model",
      header: t("Cars.form.model.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "year",
      header: t("Cars.form.year.label"),
      validationSchema: z.number().min(0, "Required"),
    },
    {
      accessorKey: "color",
      header: t("Cars.form.color.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "vin",
      header: t("Cars.form.vin.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "license_country",
      header: t("Cars.form.license_country.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "license_plate",
      header: t("Cars.form.license_plate.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "ownership_status",
      header: t("Cars.form.ownership_status.label"),
      validationSchema: z.string().min(1, "Required"),
      cellType: "select",
      options: [
        { label: t("Cars.form.ownership_status.financed"), value: "financed" },
        { label: t("Cars.form.ownership_status.owned"), value: "owned" },
        { label: t("Cars.form.ownership_status.rented"), value: "rented" },
      ],
    },
    {
      accessorKey: "monthly_payment",
      header: t("Cars.form.monthly_payment.label"),
      validationSchema: z.number().min(0, "Required"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateCar({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Car[]) => {
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

  const carTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Car) => row.id,
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
      canEditAction={canEditCar}
      canDuplicateAction={canDuplicateCar}
      canViewAction={canViewCar}
      canArchiveAction={canArchiveCar}
      canDeleteAction={canDeleteCar}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={carTableOptions}
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

export default CarsTable;
