import { useTranslations } from "next-intl";

import { MoneyFormatter } from "@/ui/inputs/currency-input";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { useAppCurrencySymbol } from "@/lib/currency-utils";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateDomain } from "@/domain/domain.hooks";
import useDomainStore from "@/domain/domain.store";
import { Domain, DomainUpdateData } from "@/domain/domain.type";

const DomainCard = ({
  domain,
  onActionClicked,
}: {
  domain: Domain;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateDomain } = useUpdateDomain();
  const data = useDomainStore((state) => state.data);
  const setData = useDomainStore((state) => state.setData);
  const currency = useAppCurrencySymbol().symbol;

  const handleEdit = createHandleEdit<Domain, DomainUpdateData>(setData, updateDomain, data);

  let recurringCost =
    domain.payment_cycle === "monthly" ? domain.monthly_payment : domain.annual_payment;

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
      <div className="flex items-center justify-end">
        <span className="money">
          {MoneyFormatter(recurringCost || 0)} {currency}
          <span className="text-sm text-gray-500">
            {" \\ " + t(`PaymentCycles.${domain.payment_cycle}`)}
          </span>
        </span>
      </div>
    </ModuleCard>
  );
};

export default DomainCard;
