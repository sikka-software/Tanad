import { useTranslations } from "next-intl";

import { Badge } from "@/ui/badge";
import { ExtendedColumnDef } from "@/ui/sheet-table";

import CurrencyCell from "@/tables/currency-cell";
import SelectCell from "@/tables/select-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { useFormatDate } from "@/utils/date-utils";

import { EmployeeRequest, EmployeeRequestStatus } from "@/employee-request/employee-request.type";

import useUserStore from "@/stores/use-user-store";

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
    },
    {
      accessorKey: "employee_id",
      header: t("EmployeeRequests.form.employee.label"),
      cell: ({ row }) => row.original.employee_id,
    },

    {
      accessorKey: "start_date",
      header: t("EmployeeRequests.form.start_date.label"),
      cell: ({ row }) => useFormatDate(row.original.start_date),
    },
    {
      accessorKey: "end_date",
      header: t("EmployeeRequests.form.end_date.label"),
      cell: ({ row }) => useFormatDate(row.original.end_date),
    },
    {
      accessorKey: "amount",
      header: t("EmployeeRequests.form.amount.label"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "description",
      header: t("EmployeeRequests.form.description.label"),
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
