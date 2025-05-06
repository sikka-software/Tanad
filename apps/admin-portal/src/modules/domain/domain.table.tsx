import { useTranslations } from "next-intl";
import React, { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import CurrencyCell from "@/components/tables/currency-cell";

import { ModuleTableProps } from "@/types/common.type";

import useUserStore from "@/stores/use-user-store";

import { useUpdateDomain } from "./domain.hooks";
import useDomainStore from "./domain.store";
import { Domain } from "./domain.type";

const DomainsTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Domain>) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);
  const { mutate: updateDomain } = useUpdateDomain();
  const selectedRows = useDomainStore((state) => state.selectedRows);
  const setSelectedRows = useDomainStore((state) => state.setSelectedRows);

  const canEditDomain = useUserStore((state) => state.hasPermission("domains.update"));
  const canDuplicateDomain = useUserStore((state) => state.hasPermission("domains.duplicate"));
  const canViewDomain = useUserStore((state) => state.hasPermission("domains.view"));
  const canArchiveDomain = useUserStore((state) => state.hasPermission("domains.archive"));
  const canDeleteDomain = useUserStore((state) => state.hasPermission("domains.delete"));

  // Create a selection state object for the table
  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Domain>[] = [
    {
      accessorKey: "domain_name",
      header: t("Domains.form.domain_name.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "registrar",
      header: t("Domains.form.registrar.label"),
      validationSchema: z.string().min(1, "Required"),
    },
    {
      accessorKey: "monthly_cost",
      header: t("Domains.form.monthly_cost.label"),
      validationSchema: z.number().min(0, "Required"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "annual_cost",
      header: t("Domains.form.annual_cost.label"),
      validationSchema: z.number().min(0, "Required"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "payment_cycle",
      cellType: "select",
      options: [
        { label: t("Domains.form.payment_cycle.monthly"), value: "monthly" },
        { label: t("Domains.form.payment_cycle.annual"), value: "annual" },
      ],
      header: t("Domains.form.payment_cycle.label"),
      validationSchema: z.string().min(1, "Required"),
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "domain_id") return;
    await updateDomain({ id: rowId, data: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Domain[]) => {
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

  const domainTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Domain) => row.id,
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
      canEditAction={canEditDomain}
      canDuplicateAction={canDuplicateDomain}
      canViewAction={canViewDomain}
      canArchiveAction={canArchiveDomain}
      canDeleteAction={canDeleteDomain}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={domainTableOptions}
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

export default DomainsTable;
