import React, { useMemo } from "react";

import { useLandingPricingStore } from "@/stores/landing-pricing-store";

import ModuleCard from "./module-card";

const ModuleList: React.FC = () => {
  const { allModules } = useLandingPricingStore();

  const categorizedModules = useMemo(() => {
    const result: Record<string, typeof allModules> = {
      infrastructure: [],
      business: [],
      finance: [],
      hr: [],
      it: [],
    };

    allModules.forEach((module) => {
      if (result[module.category]) {
        result[module.category].push(module);
      }
    });

    return result;
  }, [allModules]);

  // Only show categories that have modules
  const categories = Object.entries(categorizedModules).filter(
    ([_, modules]) => modules.length > 0,
  );

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Available Modules</h2>
      <p className="mb-6 text-gray-600">Drag modules to their matching department</p>

      {categories.length > 0 ? (
        <div className="space-y-6">
          {categories.map(([category, modules]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {modules.map((module) => (
                  <ModuleCard key={module.id} module={module} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">
          <p>No more modules available</p>
          <p className="mt-2 text-sm">You've added all modules to departments!</p>
        </div>
      )}
    </div>
  );
};

export default ModuleList;
