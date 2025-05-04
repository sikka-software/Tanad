import React from "react";

import {
  allModules,
  Department,
  getIconComponent,
  useLandingPricingStore,
} from "@/stores/landing-pricing-store";

interface DepartmentBoxProps {
  department: Department;
}

const DepartmentBox: React.FC<DepartmentBoxProps> = ({ department }) => {
  const { toggleModule } = useLandingPricingStore();
  const IconComponent = getIconComponent(department.icon);

  const availableModules = allModules.filter((m) => m.category === department.id);

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <div
        className={`flex items-center gap-2 rounded-t-lg px-4 py-3 ${department.color} text-white`}
      >
        <IconComponent size={20} />
        <h3 className="font-semibold">{department.name}</h3>
      </div>

      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 gap-3">
          {availableModules.map((module) => {
            const isSelected = department.modules.some((m) => m.id === module.id);
            const ModuleIcon = getIconComponent(module.icon);

            return (
              <button
                key={module.id}
                onClick={() => toggleModule(module.id, department.id)}
                className={`flex flex-col rounded-lg border p-3 transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ModuleIcon
                      size={18}
                      className={isSelected ? "text-blue-500" : "text-gray-500"}
                    />
                    <span
                      className={`font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}
                    >
                      {module.name}
                    </span>
                  </div>
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                </div>
                <p className={`mt-1 text-xs ${isSelected ? "text-blue-600" : "text-gray-500"}`}>
                  {module.description}
                </p>
                <div className="mt-2">
                  <span
                    className={`text-sm font-semibold ${isSelected ? "text-blue-600" : "text-gray-600"}`}
                  >
                    ${module.basePrice}/mo
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DepartmentBox;
