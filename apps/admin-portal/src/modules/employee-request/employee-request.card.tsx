import { useTranslations } from "next-intl";

import { createHandleEdit } from "@/utils/module-utils";

import ModuleCard from "@/components/cards/module-card";

import { Employee } from "@/employee/employee.types";

import { useUpdateEmployeeRequest } from "@/employee-request/employee-request.hooks";
import useEmployeeRequestStore from "@/employee-request/employee-request.store";
import {
  EmployeeRequest,
  EmployeeRequestStatus,
  EmployeeRequestStatusProps,
  EmployeeRequestUpdateData,
} from "@/employee-request/employee-request.type";

const EmployeeRequestCard = ({
  employeeRequest,
  employee,
  onActionClicked,
}: {
  employeeRequest: EmployeeRequest;
  employee: Employee | null;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateEmployeeRequest } = useUpdateEmployeeRequest();
  const data = useEmployeeRequestStore((state) => state.data);
  const setData = useEmployeeRequestStore((state) => state.setData);

  const handleEdit = createHandleEdit<EmployeeRequest, EmployeeRequestUpdateData>(
    setData,
    updateEmployeeRequest,
    data,
  );

  return (
    <ModuleCard
      id={employeeRequest.id}
      parentTranslationKey="EmployeeRequests"
      title={employeeRequest.title}
      subtitle={employeeRequest.description || ""}
      currentStatus={employeeRequest.status as EmployeeRequestStatusProps}
      statuses={Object.values(EmployeeRequestStatus) as EmployeeRequestStatusProps[]}
      onStatusChange={(status: EmployeeRequestStatusProps) =>
        handleEdit(employeeRequest.id, "status", status)
      }
      onEdit={() => onActionClicked("edit", employeeRequest.id)}
      onDelete={() => onActionClicked("delete", employeeRequest.id)}
      onDuplicate={() => onActionClicked("duplicate", employeeRequest.id)}
    >
      <div className="bg-400 flex h-full flex-col items-start justify-between">
        <div className="bg-400 flex flex-col items-start">
          <div className="text-sm text-gray-500">
            {employee && <p>{employee?.first_name + " " + employee?.last_name}</p>}
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
        </div>
        <div className="w-full text-end text-sm text-gray-500">
          {t(`EmployeeRequests.form.type.${employeeRequest.type}`)}
        </div>
      </div>
    </ModuleCard>
  );
};

export default EmployeeRequestCard;
