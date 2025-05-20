import { CellContext } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { MoneyFormatter } from "@/ui/inputs/currency-input";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import { renderLocationCell, renderLocationOption } from "@/components/app/location-options";
import { ComboboxAdd } from "@/components/ui/comboboxes/combobox-add";

import SelectCell from "@/tables/select-cell";
import StatusCell from "@/tables/status-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { useAppCurrencySymbol } from "@/lib/currency-utils";
import { useFormatDate } from "@/lib/date-utils";

import { useBranches } from "../branch/branch.hooks";
import { useDepartments } from "../department/department.hooks";
import { useOffices } from "../office/office.hooks";
import { useOnlineStores } from "../online-store/online-store.hooks";
import { useWarehouses } from "../warehouse/warehouse.hooks";
import { Job } from "./job.type";

const useJobColumns = (handleEdit?: (rowId: string, columnId: string, value: unknown) => void) => {
  const t = useTranslations();
  const lang = useLocale();
  const currency = useAppCurrencySymbol({ usd: { className: "-ms-1" } }).symbol;

  const { data: departments = [], isLoading: isFetchingDepartments } = useDepartments();
  const { data: offices = [], isLoading: isFetchingOffices } = useOffices();
  const { data: warehouses = [], isLoading: isFetchingWarehouses } = useWarehouses();
  const { data: branches = [], isLoading: isFetchingBranches } = useBranches();
  const { data: onlineStores = [], isLoading: isFetchingOnlineStores } = useOnlineStores();

  const isFetchingLocations =
    isFetchingOffices || isFetchingWarehouses || isFetchingBranches || isFetchingOnlineStores;

  const locationOptions = useMemo(() => {
    let officesOptions = offices.map((location) => ({
      id: location.id,
      label: location.name,
      value: location.id,
      metadata: { type: "office" as const },
    }));
    let warehousesOptions = warehouses.map((location) => ({
      id: location.id,
      label: location.name,
      value: location.id,
      metadata: { type: "warehouse" as const },
    }));
    let branchesOptions = branches.map((location) => ({
      id: location.id,
      label: location.name,
      value: location.id,
      metadata: { type: "branch" as const },
    }));
    return [...officesOptions, ...warehousesOptions, ...branchesOptions];
  }, [offices, warehouses, branches]);

  const columns: ExtendedColumnDef<Job>[] = [
    {
      accessorKey: "title",
      header: t("Jobs.form.title.label"),
    },
    {
      accessorKey: "type",
      header: t("Jobs.form.type.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={async (value) => handleEdit?.(row.id, "type", value)}
          cellValue={getValue()}
          options={[
            { label: t("Jobs.form.type.full_time"), value: "full_time" },
            { label: t("Jobs.form.type.part_time"), value: "part_time" },
            { label: t("Jobs.form.type.contract"), value: "contract" },
            { label: t("Jobs.form.type.internship"), value: "internship" },
            { label: t("Jobs.form.type.temporary"), value: "temporary" },
          ]}
        />
      ),
    },
    {
      accessorKey: "department",
      header: t("Jobs.form.department.label"),
    },
    {
      accessorKey: "location",
      header: t("Jobs.form.location.label"),
      enableEditing: false,
      noPadding: true,
      cell: ({ row }) => {
        return (
          <ComboboxAdd
            isolated
            inCell
            data={locationOptions}
            defaultValue={row.original.location || ""}
            valueKey="value"
            labelKey="label"
            onChange={(selectedValue) => {
              const selectedOption = locationOptions.find((opt) => opt.value === selectedValue);
              if (selectedOption) {
                handleEdit?.(row.id, "location", selectedOption.value);
              }
            }}
            texts={{
              searchPlaceholder: t("Pages.Locations.search"),
              noItems: t("Pages.Locations.no_locations_found"),
            }}
            isLoading={isFetchingLocations}
            renderOption={(option) => renderLocationOption(option, t)}
            renderSelected={(item) => renderLocationCell(item.metadata.type, item.label || "", t)}
            addText={t("Pages.Locations.add")}
            // onAddClick={() => {
            //   setIsChooseLocationDialogOpen(true);
            // }}
            dir={lang === "ar" ? "rtl" : "ltr"}
          />
        );
      },
    },
    {
      accessorKey: "salary",
      header: t("Jobs.form.salary.label"),
      cell: (props: CellContext<Job, unknown>) =>
        props.row.original.salary ? (
          <span className="flex flex-row items-center gap-1 text-sm font-medium">
            {MoneyFormatter(Number(props.row.original.salary))}
            {currency}
          </span>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "total_positions",
      header: t("Jobs.form.total_positions.label"),
      cell: (props: CellContext<Job, unknown>) => {
        const value = props.row.original.total_positions;
        if (value === null || value === undefined) return "N/A";
        const num = typeof value === "number" ? value : parseInt(value, 10);
        return isNaN(num) ? "N/A" : num;
      },
    },
    {
      accessorKey: "occupied_positions",
      header: t("Jobs.form.occupied_positions.label"),
      cell: (props: CellContext<Job, unknown>) => {
        const value = props.row.original.occupied_positions;
        if (value === null || value === undefined) return "N/A";
        const num = typeof value === "number" ? value : parseInt(value, 10);
        return isNaN(num) ? "N/A" : num;
      },
    },
    {
      accessorKey: "start_date",
      header: t("Jobs.form.start_date.label"),
      cell: ({ row }) => useFormatDate(row.original.start_date),
    },
    {
      accessorKey: "end_date",
      header: t("Jobs.form.end_date.label"),
      cell: ({ row }) => useFormatDate(row.original.end_date),
    },
    {
      accessorKey: "created_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.created_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,
      enableEditing: false,
      header: t("Metadata.updated_at.label"),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("CommonStatus.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => {
        const status = getValue() as string;
        const rowId = row.original.id;
        return (
          <StatusCell
            status={status}
            statusOptions={[
              { label: t("CommonStatus.active"), value: "active" },
              { label: t("CommonStatus.inactive"), value: "inactive" },
            ]}
            onStatusChange={async (value) => handleEdit?.(rowId, "status", value)}
          />
        );
      },
    },
  ];
  return columns;
};

export default useJobColumns;
