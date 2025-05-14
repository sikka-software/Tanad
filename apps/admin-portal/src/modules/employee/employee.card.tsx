import { useTranslations } from "next-intl";

import ModuleCard from "@/components/cards/module-card";

import { useUpdateEmployee } from "@/employee/employee.hooks";
import useEmployeeStore from "@/employee/employee.store";
import { Employee, EmployeeStatus, EmployeeStatusProps } from "@/employee/employee.types";

const EmployeeCard = ({
  employee,
  position,
  onActionClicked,
}: {
  employee: Employee;
  position: string;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateEmployee } = useUpdateEmployee();
  const data = useEmployeeStore((state) => state.data);
  const setData = useEmployeeStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateEmployee({ id: rowId, data: { [columnId]: value } });
  };

  return (
    <ModuleCard
      id={employee.id}
      parentTranslationKey="Employees"
      title={employee.first_name + " " + employee.last_name}
      subtitle={position || ""}
      currentStatus={employee.status as EmployeeStatusProps}
      statuses={Object.values(EmployeeStatus) as EmployeeStatusProps[]}
      onStatusChange={(status: EmployeeStatusProps) => handleEdit(employee.id, "status", status)}
      onEdit={() => onActionClicked("edit", employee.id)}
      onDelete={() => onActionClicked("delete", employee.id)}
      onDuplicate={() => onActionClicked("duplicate", employee.id)}
    >
      <div className="space-y-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</p>
        <p className="text-xs text-gray-500">
          {t("General.created_at")}:{" "}
          {employee.created_at ? new Date(employee.created_at).toLocaleDateString() : "N/A"}
        </p>
        <p className="text-xs text-gray-500">
          {t("Employees.form.hire_date.label")}:{" "}
          {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "N/A"}
        </p>
      </div>
    </ModuleCard>
  );
};

export default EmployeeCard;
