import React from "react";

import { z } from "zod";

import SheetTable from "@/components/ui/sheet-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useClientsStore } from "@/stores/clients.store";
import { Client } from "@/types/client.type";

const nameSchema = z.string().min(1, "Required");
const emailSchema = z.string().email("Invalid email");
const phoneSchema = z.string().min(1, "Required");
const addressSchema = z.string().min(1, "Required");
const citySchema = z.string().min(1, "Required");
const stateSchema = z.string().min(1, "Required");
const zipCodeSchema = z.string().min(1, "Required");
const notesSchema = z.string().optional();

const columns = [
  { accessorKey: "name", header: "Name", validationSchema: nameSchema },
  { accessorKey: "email", header: "Email", validationSchema: emailSchema },
  { accessorKey: "phone", header: "Phone", validationSchema: phoneSchema },
  { accessorKey: "address", header: "Address", validationSchema: addressSchema },
  { accessorKey: "city", header: "City", validationSchema: citySchema },
  { accessorKey: "state", header: "State", validationSchema: stateSchema },
  { accessorKey: "zip_code", header: "ZIP Code", validationSchema: zipCodeSchema },
  { accessorKey: "notes", header: "Notes", validationSchema: notesSchema },
];

interface ClientsTableProps {
  data: Client[];
  isLoading?: boolean;
  error?: Error | null;
}

const ClientsTable = ({ data, isLoading, error }: ClientsTableProps) => {
  const { updateClient } = useClientsStore();

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    await updateClient(rowId, { [columnId]: value });
  };

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (error) {
    return (
      <div className="m-4 mb-0 rounded bg-red-800 p-2 text-center">
        Error loading clients: {error.message}
      </div>
    );
  }

  return <SheetTable columns={columns} data={data} onEdit={handleEdit} showHeader={true} />;
};

export default ClientsTable;
