import { useTranslations } from "next-intl";

import { MoneyFormatter } from "@/ui/inputs/currency-input";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { useAppCurrencySymbol } from "@/lib/currency-utils";

import { useUpdatePurchase } from "@/purchase/purchase.hooks";
import usePurchaseStore from "@/purchase/purchase.store";
import {
  Purchase,
  PurchaseStatus,
  PurchaseStatusProps,
  PurchaseUpdateData,
} from "@/purchase/purchase.type";

const PurchaseCard = ({
  purchase,
  onActionClicked,
}: {
  purchase: Purchase;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const currency = useAppCurrencySymbol().symbol;
  const { mutate: updatePurchase } = useUpdatePurchase();
  const data = usePurchaseStore((state) => state.data);
  const setData = usePurchaseStore((state) => state.setData);

  const handleEdit = createHandleEdit<Purchase, PurchaseUpdateData>(setData, updatePurchase, data);

  return (
    <ModuleCard
      id={purchase.id}
      parentTranslationKey="Purchases"
      title={purchase.purchase_number || ""}
      subtitle={purchase.category}
      currentStatus={purchase.status as PurchaseStatusProps}
      statuses={Object.values(PurchaseStatus) as PurchaseStatusProps[]}
      onStatusChange={(status: PurchaseStatusProps) => handleEdit(purchase.id, "status", status)}
      onEdit={() => onActionClicked("edit", purchase.id)}
      onDelete={() => onActionClicked("delete", purchase.id)}
      onDuplicate={() => onActionClicked("duplicate", purchase.id)}
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-500">
          {t("Purchases.form.due_date.label")} {purchase.due_date}
        </p>
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="money text-xl font-bold">
            {MoneyFormatter(purchase.amount || 0)}
            {currency}
          </span>
        </div>
      </div>
    </ModuleCard>
  );
};

export default PurchaseCard;
