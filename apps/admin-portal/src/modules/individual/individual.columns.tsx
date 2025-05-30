import { useTranslations } from "next-intl";

import { ExtendedColumnDef } from "@/ui/sheet-table";

import StatusCell from "@/tables/status-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { Individual } from "./individual.type";

const useIndividualColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();

  const columns: ExtendedColumnDef<Individual>[] = [
    {
      accessorKey: "name",
      header: t("Individuals.form.name.label"),
    },
    {
      accessorKey: "email",
      header: t("Individuals.form.email.label"),
      cell: ({ row }) => <span dir="ltr">{row.original.email}</span>,
    },
    {
      accessorKey: "phone",
      header: t("Individuals.form.phone.label"),
      cell: ({ getValue }) => <div dir="ltr">{getValue() as string}</div>,
    },
    {
      accessorKey: "company_name",
      header: t("Individuals.form.company.label", { defaultValue: "Company" }),
      // cell: ({ row }) => {
      //   const company = row.original.company;
      //   if (company && typeof company === "object" && "name" in company) {
      //     return (company as any).name || "-";
      //   }
      //   return "-";
      // },
      enableEditing: false,
    },

    {
      accessorKey: "city",
      header: t("Forms.city.label"),
    },
    {
      accessorKey: "region",
      header: t("Forms.region.label"),
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

export default useIndividualColumns;
