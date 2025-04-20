import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import useClientStore from "@/modules/client/client.store";
import { Client } from "@/modules/client/client.type";

import { useUpdateClient } from "./client.hooks";

const nameSchema = z.string().min(1, "Required");
const emailSchema = z.string().email("Invalid email");
const phoneSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const notesSchema = z.string().optional();

interface ClientsTableProps {
  data: Client[];
  isLoading?: boolean;
  error?: Error | null;
  onActionClicked: (action: string, rowId: string) => void;
}

const ClientsTable = ({
  data: unsortedData,
  isLoading,
  error,
  onActionClicked,
}: ClientsTableProps) => {
  const t = useTranslations();
  const { mutate: updateClient } = useUpdateClient();
  const selectedRows = useClientStore((state) => state.selectedRows);
  const setSelectedRows = useClientStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Client>[] = [
    { accessorKey: "name", header: t("Clients.form.name.label"), validationSchema: nameSchema },
    { accessorKey: "email", header: t("Clients.form.email.label"), validationSchema: emailSchema },
    { accessorKey: "phone", header: t("Clients.form.phone.label"), validationSchema: phoneSchema },
    {
      accessorKey: "address",
      header: t("Clients.form.address.label"),
      validationSchema: addressSchema,
    },
    { accessorKey: "city", header: t("Clients.form.city.label"), validationSchema: citySchema },
    { accessorKey: "state", header: t("Clients.form.state.label"), validationSchema: stateSchema },
    {
      accessorKey: "zip_code",
      header: t("Clients.form.zip_code.label"),
      validationSchema: zipCodeSchema,
    },
    { accessorKey: "notes", header: t("Clients.form.notes.label"), validationSchema: notesSchema },
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
      const selectedRows = unsortedData.filter((row) => newSelection[row.id!]);
      handleRowSelectionChange(selectedRows);
    },
  };

  if (error) {
    return <ErrorComponent errorMessage={error.message} />;
  }

  return (
    <SheetTable
      columns={columns}
      data={unsortedData}
      onEdit={handleEdit}
      showHeader={true}
      enableRowSelection={true}
      enableRowActions={true}
      onActionClicked={onActionClicked}
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={clientTableOptions}
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
