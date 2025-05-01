import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { ModuleTableProps } from "@/types/common.type";

import useClientStore from "@/modules/client/client.store";
import { Client } from "@/modules/client/client.type";
import useUserStore from "@/stores/use-user-store";

import { useUpdateClient } from "./client.hooks";

const ClientsTable = ({ data, isLoading, error, onActionClicked }: ModuleTableProps<Client>) => {
  const t = useTranslations();
  const { mutate: updateClient } = useUpdateClient();
  const selectedRows = useClientStore((state) => state.selectedRows);
  const setSelectedRows = useClientStore((state) => state.setSelectedRows);

  const canEditClient = useUserStore((state) => state.hasPermission("clients.update"));
  const canDuplicateClient = useUserStore((state) => state.hasPermission("clients.duplicate"));
  const canViewClient = useUserStore((state) => state.hasPermission("clients.view"));
  const canArchiveClient = useUserStore((state) => state.hasPermission("clients.archive"));
  const canDeleteClient = useUserStore((state) => state.hasPermission("clients.delete"));

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: t("Clients.form.name.label"),
      validationSchema: z.string().min(1, t("Clients.form.name.required")),
    },
    {
      accessorKey: "email",
      header: t("Clients.form.email.label"),
      validationSchema: z.string().email(t("Clients.form.email.invalid")),
    },
    {
      accessorKey: "phone",
      header: t("Clients.form.phone.label"),
      validationSchema: z.string().min(1, t("Clients.form.phone.required")),
    },
    {
      accessorKey: "address",
      header: t("Clients.form.address.label"),
      validationSchema: z.string().min(1, t("Clients.form.address.required")),
    },
    {
      accessorKey: "city",
      header: t("Clients.form.city.label"),
      validationSchema: z.string().min(1, t("Clients.form.city.required")),
    },
    {
      accessorKey: "state",
      header: t("Clients.form.state.label"),
      validationSchema: z.string().min(1, t("Clients.form.state.required")),
    },
    {
      accessorKey: "zip_code",
      header: t("Clients.form.zip_code.label"),
      validationSchema: z.string().min(1, t("Clients.form.zip_code.required")),
    },
    {
      accessorKey: "notes",
      header: t("Clients.form.notes.label"),
      validationSchema: z.string().optional(),
    },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "client_id") return;
    await updateClient({ id: rowId, client: { [columnId]: value } });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Client[]) => {
      const newSelectedIds = rows.map((row: Client) => row.id!);
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

  const clientTableOptions = {
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    enableMultiRowSelection: true,
    getRowId: (row: Client) => row.id!,
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
      canEditAction={canEditClient}
      canDuplicateAction={canDuplicateClient}
      canViewAction={canViewClient}
      canArchiveAction={canArchiveClient}
      canDeleteAction={canDeleteClient}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={clientTableOptions}
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

export default ClientsTable;
