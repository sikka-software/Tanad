import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { z } from "zod";

import ErrorComponent from "@/ui/error-component";
import SheetTable, { ExtendedColumnDef } from "@/ui/sheet-table";
import TableSkeleton from "@/ui/table-skeleton";

import { useClientStore } from "@/modules/client/client.store";
import { Client } from "@/modules/client/client.type";

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
}

const ClientsTable = ({ data: unsortedData, isLoading, error }: ClientsTableProps) => {
  const t = useTranslations("Clients");
  const updateClient = useClientStore((state) => state.updateClient);
  const selectedRows = useClientStore((state) => state.selectedRows);
  const setSelectedRows = useClientStore((state) => state.setSelectedRows);

  const rowSelection = Object.fromEntries(selectedRows.map((id) => [id, true]));

  const columns: ExtendedColumnDef<Client>[] = [
    // Actions
    // {
    //   id: "actions",
    //   enableHiding: false,
    //   maxSize: 50,
    //   minSize: 50,
    //   size: 50,
    //   cell: ({ row }) => {
    //     const payment = row.original;

    //     return (
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button variant="ghost" className="h-8 w-8 p-0">
    //             <span className="sr-only">Open menu</span>
    //             <MoreHorizontal />
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent align="end">
    //           <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //           <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.id)}>
    //             Copy payment ID
    //           </DropdownMenuItem>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuItem>View customer</DropdownMenuItem>
    //           <DropdownMenuItem>View payment details</DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     );
    //   },
    // },
    { accessorKey: "name", header: t("form.name.label"), validationSchema: nameSchema },
    { accessorKey: "email", header: t("form.email.label"), validationSchema: emailSchema },
    { accessorKey: "phone", header: t("form.phone.label"), validationSchema: phoneSchema },
    { accessorKey: "address", header: t("form.address.label"), validationSchema: addressSchema },
    { accessorKey: "city", header: t("form.city.label"), validationSchema: citySchema },
    { accessorKey: "state", header: t("form.state.label"), validationSchema: stateSchema },
    { accessorKey: "zip_code", header: t("form.zip_code.label"), validationSchema: zipCodeSchema },
    { accessorKey: "notes", header: t("form.notes.label"), validationSchema: notesSchema },
  ];

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateClient(rowId, { [columnId]: value });
  };

  const handleRowSelectionChange = useCallback(
    (rows: Client[]) => {
      const newSelectedIds = rows.map((row: Client) => row.id!);
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
      onRowSelectionChange={handleRowSelectionChange}
      tableOptions={clientTableOptions}
    />
  );
};

export default ClientsTable;
