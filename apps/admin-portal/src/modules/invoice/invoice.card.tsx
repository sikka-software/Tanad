import { format } from "date-fns";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { MoneyFormatter } from "@/ui/inputs/currency-input";

import ModuleCard from "@/components/cards/module-card";

import { useAppCurrencySymbol } from "@/lib/currency-utils";

import { useUpdateInvoice } from "@/invoice/invoice.hooks";
import useInvoiceStore from "@/invoice/invoice.store";
import {
  Invoice,
  InvoiceStatus,
  InvoiceStatusProps,
  InvoiceUpdateData,
} from "@/invoice/invoice.type";

import useUserStore from "@/stores/use-user-store";

const InvoiceCard = ({
  invoice,
  onActionClicked,
}: {
  invoice: Invoice;
  onActionClicked: (action: string, id: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateInvoice } = useUpdateInvoice();
  const data = useInvoiceStore((state) => state.data);
  const setData = useInvoiceStore((state) => state.setData);
  const currency = useAppCurrencySymbol({ sar: { className: "size-4" } }).symbol;

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateInvoice({ id: rowId, data: { [columnId]: value } as InvoiceUpdateData });
  };

  return (
    <ModuleCard
      id={invoice.id}
      title={invoice.invoice_number}
      subtitle={invoice.client?.company || ""}
      currentStatus={invoice.status as InvoiceStatusProps}
      statuses={Object.values(InvoiceStatus) as InvoiceStatusProps[]}
      parentTranslationKey="Invoices"
      onStatusChange={(status: InvoiceStatusProps) => handleEdit(invoice.id, "status", status)}
      onEdit={() => onActionClicked("edit", invoice.id)}
      onDelete={() => onActionClicked("delete", invoice.id)}
      onDuplicate={() => onActionClicked("duplicate", invoice.id)}
      onPreview={() => onActionClicked("preview", invoice.id)}
    >
      <div>
        <h3 className="text-lg font-semibold">
          {t("Invoices.form.invoice_number.label", { number: invoice.invoice_number })}
        </h3>
        <p className="text-sm text-gray-500">{invoice.client?.company ?? "N/A"}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">{t("Invoices.form.issue_date.label")}</span>
          <span className="text-sm">
            {invoice.issue_date ? format(new Date(invoice.issue_date), "MMM dd, yyyy") : "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">{t("Invoices.form.due_date.label")}</span>
          <span className="text-sm">
            {invoice.due_date ? format(new Date(invoice.due_date), "MMM dd, yyyy") : "N/A"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">{t("Invoices.form.total.label")}</span>
          <span className="money text-lg font-bold">
            {MoneyFormatter(invoice.total || 0)} {currency}
          </span>
        </div>
        <div className="border-t pt-2">
          <p className="text-sm text-gray-500">
            {invoice.client?.name ?? "N/A"} • {invoice.client?.email ?? "N/A"}
          </p>
        </div>
      </div>
    </ModuleCard>
  );
};

export default InvoiceCard;
