import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/ui/card";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { EmployeeRequest } from "@/employee-request/employee-request.type";

import { useUpdateCompany } from "../company/company.hooks";
import useCompanyStore from "../company/company.store";
import { Company } from "../company/company.type";
import { useUpdateEmployeeRequest } from "./employee-request.hooks";
import useEmployeeRequestStore from "./employee-request.store";

const EmployeeRequestCard = ({
  employeeRequest,
  onActionClicked,
}: {
  employeeRequest: EmployeeRequest;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateEmployeeRequest } = useUpdateEmployeeRequest();
  const data = useEmployeeRequestStore((state) => state.data);
  const setData = useEmployeeRequestStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateEmployeeRequest({ id: rowId, data: { [columnId]: value } });
  };

  return (
    <ModuleCard
      id={employeeRequest.id}
      title={employeeRequest.title}
      subtitle={employeeRequest.description || ""}
      currentStatus={employeeRequest.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) =>
        handleEdit(employeeRequest.id, "status", status)
      }
      onEdit={() => onActionClicked("edit", employeeRequest.id)}
      onDelete={() => onActionClicked("delete", employeeRequest.id)}
      onDuplicate={() => onActionClicked("duplicate", employeeRequest.id)}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{employeeRequest.title}</h3>
        <div className="space-x-2">
          <span className="text-sm text-gray-500">{employeeRequest.type}</span>
          <span
            className={`inline-block rounded-full px-2 py-1 text-xs ${
              employeeRequest.status === "approved"
                ? "bg-green-100 text-green-800"
                : employeeRequest.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {employeeRequest.status}
          </span>
        </div>
      </div>
      <p className="mb-2 text-sm text-gray-600">
        {employeeRequest.description || t("no_description")}
      </p>
      <div className="text-sm text-gray-500">
        <p>Employee name here</p>
        {/* <p>{t("employee_label", { name: employeeRequest.employee_id })}</p> */}
        {employeeRequest.start_date && (
          <p>
            {t("date_range", {
              start: new Date(employeeRequest.start_date).toLocaleDateString(),
              end: employeeRequest.end_date
                ? new Date(employeeRequest.end_date).toLocaleDateString()
                : t("not_specified"),
            })}
          </p>
        )}
        {employeeRequest.amount && (
          <p>{t("amount_label", { amount: employeeRequest.amount.toFixed(2) })}</p>
        )}
      </div>
    </ModuleCard>
  );
};

export default EmployeeRequestCard;
