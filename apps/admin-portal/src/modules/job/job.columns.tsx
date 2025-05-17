import { CellContext } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { MoneyFormatter } from "@/ui/inputs/currency-input";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import SelectCell from "@/tables/select-cell";
import StatusCell from "@/tables/status-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { useAppCurrencySymbol } from "@/lib/currency-utils";
import { useFormatDate } from "@/lib/date-utils";

import { Job } from "./job.type";

const useJobColumns = (handleEdit?: (rowId: string, columnId: string, value: unknown) => void) => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Job>[] = [
    {
      accessorKey: "title",
      header: t("Jobs.form.title.label"),
      validationSchema: z.string().min(1, t("Jobs.form.title.required")),
    },
    {
      accessorKey: "type",
      header: t("Jobs.form.type.label"),
      validationSchema: z.string().min(1, t("Jobs.form.type.required")),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "type", value)}
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
      validationSchema: z.string().min(1, t("Jobs.form.department.required")),
    },
    {
      accessorKey: "location",
      header: t("Jobs.form.location.label"),
      validationSchema: z.string().min(1, t("Jobs.form.location.required")),
    },
    {
      accessorKey: "salary",
      header: t("Jobs.form.salary.label"),
      validationSchema: z.number().min(0, t("Jobs.form.salary.required")),
      cell: (props: CellContext<Job, unknown>) =>
        props.row.original.salary ? (
          <span className="flex flex-row items-center gap-1 text-sm font-medium">
            {MoneyFormatter(props.row.original.salary)}
            {useAppCurrencySymbol({ usd: { className: "-ms-1" } }).symbol}
          </span>
        ) : (
          "N/A"
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
      validationSchema: z.string().min(1, t("Metadata.created_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "updated_at",
      maxSize: 95,

      enableEditing: false,
      header: t("Metadata.updated_at.label"),
      validationSchema: z.string().min(1, t("Metadata.updated_at.required")),
      noPadding: true,
      cell: ({ getValue }) => <TimestampCell timestamp={getValue() as string} />,
    },
    {
      accessorKey: "status",
      maxSize: 80,
      header: t("CommonStatus.label"),
      validationSchema: z.enum(["active", "inactive"]),
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
