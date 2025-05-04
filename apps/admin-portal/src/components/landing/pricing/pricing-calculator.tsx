import React from "react";

import { useLandingPricingStore } from "@/stores/landing-pricing-store";

const PricingCalculator: React.FC = () => {
  const { departments, selectedTier, totalPrice, resetModules } = useLandingPricingStore();

  const totalModules = departments.reduce((count, dept) => count + dept.modules.length, 0);
  const basePrice = selectedTier.basePrice;
  const modulesPrice = departments.reduce((total, dept) => {
    return total + dept.modules.reduce((deptTotal, module) => deptTotal + module.basePrice, 0);
  }, 0);

  const discount =
    selectedTier.discount > 0 ? (basePrice + modulesPrice) * selectedTier.discount : 0;

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900">Price Breakdown</h2>
        <p className="mb-6 text-gray-600">See how your selected modules affect your price</p>

        <div className="mb-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">{selectedTier.name} plan base price</span>
            <span className="font-semibold">${basePrice}</span>
          </div>

          {departments.map((dept) => {
            if (dept.modules.length === 0) return null;

            const deptTotal = dept.modules.reduce((total, mod) => total + mod.basePrice, 0);

            return (
              <div key={dept.id} className="border-t border-gray-100 pt-2">
                <div className="mb-2 flex justify-between">
                  <span className="text-gray-600">
                    {dept.name} modules ({dept.modules.length})
                  </span>
                  <span className="font-semibold">${deptTotal}</span>
                </div>

                {dept.modules.map((mod) => (
                  <div key={mod.id} className="flex justify-between pl-4 text-sm text-gray-500">
                    <span>{mod.name}</span>
                    <span>${mod.basePrice}</span>
                  </div>
                ))}
              </div>
            );
          })}

          {selectedTier.discount > 0 && (
            <div className="flex justify-between border-t border-gray-100 pt-2 text-green-600">
              <span>
                {selectedTier.name} plan discount ({selectedTier.discount * 100}%)
              </span>
              <span>-${Math.round(discount)}</span>
            </div>
          )}
        </div>

        <div className="border-t-2 border-gray-200 pt-4">
          <div className="flex justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900">Total monthly price</span>
              <p className="text-sm text-gray-500">
                {totalModules} modules on {selectedTier.name} plan
              </p>
            </div>
            <span className="text-2xl font-bold text-blue-600">${totalPrice}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Need to start over?</p>
          </div>
          <button
            onClick={resetModules}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-100"
          >
            Reset Selections
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingCalculator;
