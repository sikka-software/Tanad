import React, { useId } from "react";

import { getIconComponent } from "@/stores/landing-pricing-store";
import { Module } from "@/stores/landing-pricing-store";

import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";

interface ModuleCardProps {
  module: Module;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  const IconComponent = getIconComponent(module.icon);
  const id = useId();
  return (
    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
      <Checkbox
        id={id}
        className="order-1 after:absolute after:inset-0"
        aria-describedby={`${id}-description`}
      />
      <div className="flex grow items-start gap-3">
        <IconComponent size={20} />
        <div className="grid gap-2">
          <Label htmlFor={id}>
            {module.name}
            <span className="text-muted-foreground text-xs leading-[inherit] font-normal">
              {/* (Sublabel) */}
            </span>
          </Label>
          <p id={`${id}-description`} className="text-muted-foreground text-xs">
            {module.description}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="w-full text-start text-sm font-semibold text-blue-600">
              ${module.basePrice}/mo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
