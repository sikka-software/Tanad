import React from "react";

import { pricingTiers, useLandingPricingStore } from "@/stores/landing-pricing-store";

const PricingHero: React.FC = () => {
  const { selectedTier, setSelectedTier, totalPrice, getTotalModulesCount } =
    useLandingPricingStore();

  return (
    <div className="px-4 py-16">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
          Build Your Perfect Enterprise Solution
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          Select modules to create a custom solution that fits your business needs.
        </p>

        <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-8 flex flex-col justify-center gap-4 md:flex-row">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex-1 cursor-pointer rounded-lg border-2 p-4 transition-all duration-300 ${
                  selectedTier.name === tier.name
                    ? "scale-105 transform border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setSelectedTier(tier)}
              >
                <h3 className="mb-1 text-xl font-semibold">{tier.name}</h3>
                <p className="mb-2 text-sm text-gray-600">{tier.description}</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${tier.basePrice}
                  <span className="text-base font-normal text-gray-500">/mo</span>
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {tier.name === "Enterprise"
                    ? "Unlimited modules"
                    : `Up to ${tier.maxModules} modules`}
                  {tier.discount > 0 ? `, ${tier.discount * 100}% discount` : ""}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex flex-col items-center justify-between md:flex-row">
              <div>
                <h3 className="mb-1 text-2xl font-bold">Your Custom Solution</h3>
                <p className="opacity-90">
                  {selectedTier.name} plan with {getTotalModulesCount()} modules
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm opacity-90">Estimated price</p>
                <p className="text-4xl font-bold">
                  ${totalPrice}
                  <span className="text-lg opacity-90">/mo</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mb-6 text-gray-600">
          Click on modules to add or remove them from your solution
        </p>
      </div>
    </div>
  );
};

export default PricingHero;
