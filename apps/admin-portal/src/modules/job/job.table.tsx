import { type CellContext } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import React from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { MoneyFormatter } from "@/components/ui/currency-input";

import { getCurrencySymbol } from "@/lib/currency-utils";

import { ModuleTableProps } from "@/types/common.type";

import { useUpdateJob } from "@/job/job.hooks";
import useJobsStore from "@/job/job.store";
import { Job } from "@/job/job.type";

import useUserStore from "@/stores/use-user-store";

const JobTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Job>) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);
  const { mutateAsync: updateJob } = useUpdateJob();
  const setSelectedRows = useJobsStore((state) => state.setSelectedRows);
  const selectedRows = useJobsStore((state) => state.selectedRows);

  const canEditJob = useUserStore((state) => state.hasPermission("jobs.update"));
  const canDuplicateJob = useUserStore((state) => state.hasPermission("jobs.duplicate"));
  const canViewJob = useUserStore((state) => state.hasPermission("jobs.view"));
  const canArchiveJob = useUserStore((state) => state.hasPermission("jobs.archive"));
  const canDeleteJob = useUserStore((state) => state.hasPermission("jobs.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Job>[] = [
    {
      accessorKey: "title",
      header: t("Jobs.form.title.label"),
      validationSchema: z.string().min(1, t("Jobs.form.title.required")),
    },
    {
      accessorKey: "type",
      header: t("Jobs.form.type.label"),
      cellType: "select",
      options: [
        { label: t("Jobs.form.type.full_time"), value: "full_time" },
        { label: t("Jobs.form.type.part_time"), value: "part_time" },
        { label: t("Jobs.form.type.contract"), value: "contract" },
        { label: t("Jobs.form.type.internship"), value: "internship" },
        { label: t("Jobs.form.type.temporary"), value: "temporary" },
      ],
      validationSchema: z.string().min(1, t("Jobs.form.type.required")),
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
            {
              getCurrencySymbol(currency || "sar", {
                usdClassName: "-ms-1",
              }).symbol
            }
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
      accessorKey: "status",
      maxSize: 80,
      header: t("Jobs.form.status.label"),
      validationSchema: z.boolean(),
      cellType: "status",
      options: [
        { value: "active", label: t("Jobs.form.status.active") },
        { value: "inactive", label: t("Jobs.form.status.inactive") },
      ],
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateJob({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = (rows: Job[]) => {
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

  const jobTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Job) => row.id!,
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
      canEditAction={canEditJob}
      canDuplicateAction={canDuplicateJob}
      canViewAction={canViewJob}
      canArchiveAction={canArchiveJob}
      canDeleteAction={canDeleteJob}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={jobTableOptions}
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

export default JobTable;
