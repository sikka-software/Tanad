import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import React, { useCallback } from "react";

import {
  allModules,
  Department,
  getIconComponent,
  useLandingPricingStore,
  Module,
} from "@/stores/landing-pricing-store";

import ModuleCard from "./module-card";

// TODO: Populate this map with the actual color names and hex values used in your landing-pricing-store.ts
const colorMap: { [key: string]: string } = {
  // Updated keys to include 'bg-' prefix based on console logs
  "bg-blue-500": "#3b82f6",
  "bg-blue-300": "#93c5fd",
  "bg-green-500": "#22c55e",
  "bg-green-300": "#dcfce7",
  "bg-red-500": "#ef4444",
  "bg-red-300": "#fecaca",
  "bg-purple-500": "#a855f7",
  "bg-purple-300": "#e9d5ff",
  "bg-orange-500": "#f97316",
  "bg-orange-300": "#fdba74",
  "bg-indigo-500": "#6366f1",
  "bg-indigo-300": "#c4b5fd",
  // Add any other 'bg-' prefixed colors used by your departments here...
};

interface DepartmentBoxProps {
  department: Department;
}

const DepartmentBox: React.FC<DepartmentBoxProps> = ({ department: departmentProp }) => {
  const t = useTranslations();
  const { theme } = useTheme();
  const toggleModule = useLandingPricingStore((state) => state.toggleModule);

  const selectedModules = useLandingPricingStore(
    (state) =>
      state.departments.find((d) => d.id === departmentProp.id)?.modules || departmentProp.modules,
  );

  const IconComponent = getIconComponent(departmentProp.icon);
  const availableModules = allModules.filter((m) => m.category === departmentProp.id);

  // Get the hex color from the map, defaulting to black if not found
  const colorValue = colorMap[departmentProp.color[theme as "light" | "dark"]] || "#000000";

  const handleToggle = useCallback(
    (moduleId: string) => {
      toggleModule(moduleId, departmentProp.id);
    },
    [toggleModule, departmentProp.id],
  );

  return (
    <div className="border-input bg-background flex flex-col rounded-lg border shadow-sm">
      <div
        className={`flex items-center gap-2 rounded-t-lg px-4 py-3 text-white`}
        style={{
          backgroundImage: `linear-gradient(to left, var(--background) 50%, ${colorValue} 200%)`,
        }}
      >
        <IconComponent size={20} className="text-primary" />
        <h3 className="text-primary font-semibold">{t(departmentProp.name)}</h3>
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
