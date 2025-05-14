import ModuleCard from "@/components/cards/module-card";
import { MoneyFormatter } from "@/components/ui/currency-input";

import { getCurrencySymbol } from "@/lib/currency-utils";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateDomain } from "@/domain/domain.hooks";
import useDomainStore from "@/domain/domain.store";
import { Domain } from "@/domain/domain.type";
import useUserStore from "@/stores/use-user-store";

const DomainCard = ({
  domain,
  onActionClicked,
}: {
  domain: Domain;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const { mutate: updateDomain } = useUpdateDomain();
  const data = useDomainStore((state) => state.data);
  const setData = useDomainStore((state) => state.setData);
  const currency = useUserStore((state) => state.profile?.user_settings.currency);
  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateDomain({ id: rowId, data: { [columnId]: value } });
  };

  let recurringCost = domain.payment_cycle === "monthly" ? domain.monthly_cost : domain.annual_cost;
  return (
    <ModuleCard
      id={domain.id}
      title={domain.domain_name}
      subtitle={domain.registrar || ""}
      currentStatus={domain.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(domain.id, "status", status)}
      onEdit={() => onActionClicked("edit", domain.id)}
      onDelete={() => onActionClicked("delete", domain.id)}
      onDuplicate={() => onActionClicked("duplicate", domain.id)}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Status:</p>
        <span className="money">
          {MoneyFormatter(recurringCost || 0)} {getCurrencySymbol(currency || "sar").symbol}
        </span>
        <p className="text-sm text-gray-500">Expires: {domain.payment_cycle}</p>
      </div>
    </ModuleCard>
  );
};

export default DomainCard;
