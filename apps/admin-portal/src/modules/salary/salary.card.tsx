import { CalendarDays, CircleDollarSign, ReceiptText } from "lucide-react";

import ModuleCard from "@/components/cards/module-card";
import { MoneyFormatter } from "@/components/ui/inputs/currency-input";

import { useAppCurrencySymbol } from "@/lib/currency-utils";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateSalary } from "@/salary/salary.hooks";
import useSalaryStore from "@/salary/salary.store";
import { Salary } from "@/salary/salary.type";

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
};

const SalaryCard = ({
  salary,
  employee,
  onActionClicked,
}: {
  salary: Salary;
  employee: string;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const { mutate: updateSalary } = useUpdateSalary();
  const data = useSalaryStore((state) => state.data);
  const setData = useSalaryStore((state) => state.setData);
  const currency = useAppCurrencySymbol().symbol;

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateSalary({ id: rowId, data: { [columnId]: value } });
  };
  console.log("dedeuctions ", salary.deductions);
  return (
    <ModuleCard
      id={salary.id}
      title={employee}
      subtitle={formatDate(salary.payment_date)}
      currentStatus={salary.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(salary.id, "status", status)}
      onEdit={() => onActionClicked("edit", salary.id)}
      onDelete={() => onActionClicked("delete", salary.id)}
      onDuplicate={() => onActionClicked("duplicate", salary.id)}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarDays className="h-4 w-4" />
          <span>{`${formatDate(salary.start_date)} - ${formatDate(salary.end_date)}`}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CircleDollarSign className="h-4 w-4" />
          <span className="money">
            {MoneyFormatter(salary.amount)}
            {currency}
          </span>
        </div>

        {salary.deductions && Array.isArray(salary.deductions) && salary.deductions.length > 0 && (
          <div className="flex items-center gap-2 border-t pt-3 text-sm text-gray-500">
            <ReceiptText className="h-4 w-4 flex-shrink-0" />
            <p>Deductions included</p>
          </div>
        )}
      </div>
    </ModuleCard>
  );
};

export default SalaryCard;
