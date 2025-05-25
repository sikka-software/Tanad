import { useTranslations } from "next-intl";

import { ExtendedColumnDef } from "@/ui/sheet-table";

import CurrencyCell from "@/tables/currency-cell";
import SelectCell from "@/tables/select-cell";
import TimestampCell from "@/tables/timestamp-cell";

import { useFormatDate } from "@/utils/date-utils";

import { Purchase, PurchaseStatus } from "@/purchase/purchase.type";

import useUserStore from "@/stores/use-user-store";

const usePurchaseColumns = (
  handleEdit?: (rowId: string, columnId: string, value: unknown) => void,
) => {
  const t = useTranslations();
  const currency = useUserStore((state) => state.profile?.user_settings?.currency);

  const columns: ExtendedColumnDef<Purchase>[] = [
    {
      accessorKey: "purchase_number",
      header: t("Purchases.form.purchase_number.label"),
    },
    {
      accessorKey: "description",
      header: t("Purchases.form.description.label"),
    },
    {
      accessorKey: "amount",
      header: t("Purchases.form.amount.label"),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "category",
      header: t("Purchases.form.category.label"),
    },
    {
      accessorKey: "due_date",
      header: t("Purchases.form.due_date.label"),
      cell: ({ row }) => useFormatDate(row.original.due_date),
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
      header: t("Purchases.form.status.label"),
      noPadding: true,
      enableEditing: false,
      cell: ({ getValue, row }) => (
        <SelectCell
          onChange={(value) => handleEdit?.(row.id, "status", value)}
          cellValue={getValue()}
          options={PurchaseStatus.map((status) => ({
            label: t(`Purchases.form.status.${status}`),
            value: status,
          }))}
        />
      ),
    },
  ];

  return columns;
};

export default usePurchaseColumns;
