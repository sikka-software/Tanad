import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Employee } from "@/modules/employee/employee.types";

const EmployeeCard = ({ employee }: { employee: Employee }) => {
  const t = useTranslations();
  return (
    <Card key={employee.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {employee.first_name} {employee.last_name}
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">{employee.email}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
          <p className="text-xs text-gray-500">
            {t("General.created_at")}: {new Date(employee.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;
