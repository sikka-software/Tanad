import CurrencyCell from "@/components/tables/currency-cell";
import SelectCell from "@/components/tables/select-cell";
import { Badge } from "@/components/ui/badge";
import useUserStore from "@/stores/use-user-store";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { EmployeeRequest, EmployeeRequestStatus } from "./employee-request.type";

const useEmployeeRequestColumns = (
  handleEdit?: (id: string, field: string, value: string) => void,
) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const columns: ExtendedColumnDef<EmployeeRequest>[] = [
    {
      accessorKey: "type",
      enableEditing: false,
      header: t("EmployeeRequests.form.type.label"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) => (
        <Badge variant="outline" className="capitalize">
          {t(`EmployeeRequests.form.type.${row.original.type.toLowerCase()}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "title",
      header: t("EmployeeRequests.form.title.label"),
      validationSchema: z.string().min(1, t("EmployeeRequests.form.title.required")),
    },

    {
      accessorKey: "start_date",
      header: t("EmployeeRequests.form.date_range.start"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) =>
        row.original.start_date ? format(new Date(row.original.start_date), "PP") : "-",
    },
    {
      accessorKey: "end_date",
      header: t("EmployeeRequests.form.date_range.end"),
      cell: ({ row }: { row: { original: EmployeeRequest } }) =>
        row.original.end_date ? format(new Date(row.original.end_date), "PP") : "-",
    },
    {
      accessorKey: "amount",
      header: t("EmployeeRequests.form.amount.label"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "description",
      header: t("EmployeeRequests.form.description.label"),
      validationSchema: z.string().nullable(),
    },
    {
      accessorKey: "status",
      header: t("EmployeeRequests.form.status.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "status", value)}
          cellValue={getValue()}
          options={EmployeeRequestStatus.map((status) => ({
            label: t(`EmployeeRequests.form.status.${status}`),
            value: status,
          }))}
        />
      ),
    },
  ];

  return columns;
};

export default useEmployeeRequestColumns;
