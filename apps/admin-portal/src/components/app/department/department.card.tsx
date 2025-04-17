import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Department } from "@/types/department.type";

const DepartmentCard = ({ department }: { department: Department }) => {
  const t = useTranslations();
  return (
    <Card key={department.id} className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">{department.name}</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {department.description || t("Departments.no_description")}
          </p>
          <p className="text-xs text-gray-500">
            {t("General.created_at")}: {new Date(department.created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentCard;
