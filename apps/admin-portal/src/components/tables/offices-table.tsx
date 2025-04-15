import { useTranslations } from "next-intl";

import { Building2, Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import SheetTable from "@/components/ui/sheet-table";
import { Office } from "@/types/office.type";

interface OfficesTableProps {
  data: Office[];
  isLoading?: boolean;
  error?: Error | null;
  onEdit?: (rowId: string, columnId: keyof Office, value: Office[keyof Office]) => void;
}

export default function OfficesTable({ data, isLoading = false, error = null, onEdit }: OfficesTableProps) {
  const t = useTranslations();

  const columns = [
    {
      accessorKey: "name",
      header: t("Offices.table.name"),
    },
    {
      accessorKey: "address",
      header: t("Offices.table.address"),
      cell: ({ row }: { row: { original: Office } }) => (
        <div>
          <div>{row.original.address}</div>
          <div className="text-sm text-gray-500">
            {row.original.city}, {row.original.state} {row.original.zip_code}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: t("Offices.table.phone"),
      cell: ({ row }: { row: { original: Office } }) =>
        row.original.phone ? (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <a href={`tel:${row.original.phone}`} className="hover:text-primary">
              {row.original.phone}
            </a>
          </div>
        ) : null,
    },
    {
      accessorKey: "email",
      header: t("Offices.table.email"),
      cell: ({ row }: { row: { original: Office } }) =>
        row.original.email ? (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${row.original.email}`} className="hover:text-primary">
              {row.original.email}
            </a>
          </div>
        ) : null,
    },
    {
      accessorKey: "is_active",
      header: t("Offices.table.status"),
      cell: ({ row }: { row: { original: Office } }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? t("General.active") : t("General.inactive")}
        </Badge>
      ),
    },
  ];

  return (
    <SheetTable
      columns={columns}
      data={data}
      onEdit={onEdit}
      showHeader={true}
      totalRowValues={{}}
      footerElement={
        data.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {isLoading ? t("General.loading") : error ? t("General.error") : t("Offices.no_offices")}
          </div>
        ) : null
      }
    />
  );
} 