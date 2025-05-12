"use client";

import { Button } from "@root/src/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { BankAccount } from "./bank_account.type";

export function BankAccountsTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: {
  data: BankAccount[];
  isLoading: boolean;
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account Name</TableHead>
            <TableHead>Account Number</TableHead>
            <TableHead>Bank Name</TableHead>
            <TableHead>Account Type</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No bank accounts found. Add your first account.
              </TableCell>
            </TableRow>
          ) : (
            data.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.name}</TableCell>
                <TableCell>{account.account_number || "—"}</TableCell>
                <TableCell>{account.bank_name}</TableCell>
                <TableCell>{account.account_type || "—"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(account.status)}>{account.status}</Badge>
                </TableCell>
                <TableCell>
                  <Button onClick={() => onEdit(account)} variant="outline">
                    Edit
                  </Button>
                  <Button onClick={() => onDelete(account)} variant="outline">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account Name</TableHead>
            <TableHead>Account Number</TableHead>
            <TableHead>Bank Name</TableHead>
            <TableHead>Account Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-[150px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[120px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[150px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[100px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[80px]" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-[80px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
