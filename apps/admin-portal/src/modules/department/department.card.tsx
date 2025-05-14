import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/ui/card";

import ModuleCard from "@/components/cards/module-card";

import { CommonStatus } from "@/types/common.type";
import { CommonStatusProps } from "@/types/common.type";

import { useUpdateDepartment } from "@/department/department.hooks";
import useDepartmentStore from "@/department/department.store";
import { Department } from "@/department/department.type";

const DepartmentCard = ({
  department,
  onActionClicked,
}: {
  department: Department;
  onActionClicked: (action: string, rowId: string) => void;
}) => {
  const t = useTranslations();
  const { mutate: updateDepartment } = useUpdateDepartment();
  const data = useDepartmentStore((state) => state.data);
  const setData = useDepartmentStore((state) => state.setData);

  const handleEdit = async (rowId: string, columnId: string, value: unknown) => {
    if (columnId === "id") return;
    setData?.((data || []).map((row) => (row.id === rowId ? { ...row, [columnId]: value } : row)));
    await updateDepartment({ id: rowId, data: { [columnId]: value } });
  };

  return (
    <ModuleCard
      id={department.id}
      title={department.name}
      subtitle={department.description || ""}
      currentStatus={department.status as CommonStatusProps}
      statuses={Object.values(CommonStatus) as CommonStatusProps[]}
      onStatusChange={(status: CommonStatusProps) => handleEdit(department.id, "status", status)}
      onEdit={() => onActionClicked("edit", department.id)}
      onDelete={() => onActionClicked("delete", department.id)}
      onDuplicate={() => onActionClicked("duplicate", department.id)}
    >
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          {t("General.created_at")}:{" "}
          {department.created_at ? new Date(department.created_at).toLocaleDateString() : ""}
        </p>
      </div>
    </ModuleCard>
  );
};

export default DepartmentCard;
