import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import {
  allModules,
  Department,
  getIconComponent,
  useLandingPricingStore,
  Module,
} from "@/stores/landing-pricing-store";

import ModuleCard from "./module-card";

interface DepartmentBoxProps {
  department: Department;
}

const DepartmentBox: React.FC<DepartmentBoxProps> = ({ department: departmentProp }) => {
  const t = useTranslations();
  const toggleModule = useLandingPricingStore((state) => state.toggleModule);

  const selectedModules = useLandingPricingStore(
    (state) =>
      state.departments.find((d) => d.id === departmentProp.id)?.modules || departmentProp.modules,
  );

  const IconComponent = getIconComponent(departmentProp.icon);
  const availableModules = allModules.filter((m) => m.category === departmentProp.id);

  const handleToggle = useCallback(
    (moduleId: string) => {
      toggleModule(moduleId, departmentProp.id);
    },
    [toggleModule, departmentProp.id],
  );

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <div
        className={`flex items-center gap-2 rounded-t-lg px-4 py-3 ${departmentProp.color} text-white`}
      >
        <IconComponent size={20} />
        <h3 className="font-semibold">{t(departmentProp.name)}</h3>
      </div>

      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {availableModules.map((module) => {
            const isSelected = selectedModules.some((m) => m.id === module.id);

            return (
              <ModuleCard
                key={module.id}
                module={module}
                isSelected={isSelected}
                onToggle={() => handleToggle(module.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DepartmentBox;
