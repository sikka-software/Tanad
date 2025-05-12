import CurrencyCell from "@root/src/components/tables/currency-cell";
import useUserStore from "@root/src/stores/use-user-store";
import { useTranslations } from "next-intl";
import { z } from "zod";

import { ExtendedColumnDef } from "@/components/ui/sheet-table";

import { Purchase } from "./purchase.type";

const usePurchaseColumns = () => {
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
      validationSchema: z.string().nullable(),
    },
  ];

  return columns;
};

export default usePurchaseColumns;
