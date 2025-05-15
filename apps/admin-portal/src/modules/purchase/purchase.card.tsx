import { MoneyFormatter } from "@/ui/currency-input";

import ModuleCard from "@/components/cards/module-card";

import { getCurrencySymbol } from "@/lib/currency-utils";

import { useUpdatePurchase } from "@/purchase/purchase.hooks";
import usePurchaseStore from "@/purchase/purchase.store";
import { Purchase, PurchaseStatus, PurchaseStatusProps } from "@/purchase/purchase.type";

import useUserStore from "@/stores/use-user-store";

const PurchaseCard = ({
  purchase,
  onActionClicked,
}: {
  purchase: Purchase;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const currency = useUserStore((state) => state.profile?.user_settings.currency);
  const { mutate: updatePurchase } = useUpdatePurchase();
  const data = usePurchaseStore((state) => state.data);
  const setData = usePurchaseStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updatePurchase({ id: rowId, data: { [columnId]: value } });
  };

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
        <p className="money text-sm text-gray-500">
          {MoneyFormatter(purchase.amount || 0)} {getCurrencySymbol(currency || "sar").symbol}
        </p>
        <p className="text-sm text-gray-500">Due Date: {purchase.due_date}</p>
      </div>
    </ModuleCard>
  );
};

export default PurchaseCard;
