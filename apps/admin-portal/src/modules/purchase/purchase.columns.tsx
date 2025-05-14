import { useTranslations } from "next-intl";
import { z } from "zod";

import CurrencyCell from "@/components/tables/currency-cell";
import SelectCell from "@/components/tables/select-cell";
import { ExtendedColumnDef } from "@/components/ui/sheet-table";

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
      validationSchema: z.string().min(1, t("Purchases.form.purchase_number.required")),
    },
    {
      accessorKey: "description",
      header: t("Purchases.form.description.label"),
      validationSchema: z.string().min(1, t("Purchases.form.description.required")),
    },
    {
      accessorKey: "amount",
      header: t("Purchases.form.amount.label"),
      validationSchema: z.number().min(1, t("Purchases.form.amount.required")),
      cell: ({ getValue }) => <CurrencyCell value={getValue() as number} currency={currency} />,
    },
    {
      accessorKey: "category",
      header: t("Purchases.form.category.label"),
      validationSchema: z.string().nullable(),
    },
    {
      accessorKey: "due_date",
      header: t("Purchases.form.due_date.label"),
      validationSchema: z.string().nullable(),
    },
    {
      accessorKey: "status",
      header: t("Purchases.form.status.label"),
      validationSchema: z.enum(PurchaseStatus),
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
