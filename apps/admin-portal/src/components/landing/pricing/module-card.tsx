import React from "react";

import { getIconComponent } from "@/stores/landing-pricing-store";
import { Module } from "@/stores/landing-pricing-store";

interface ModuleCardProps {
  module: Module;
  isDraggable?: boolean;
  onRemove?: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, isDraggable = true, onRemove }) => {
  const IconComponent = getIconComponent(module.icon);

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) return;

    e.dataTransfer.setData("moduleId", module.id);

    // Create a custom drag image
    const dragImage = document.createElement("div");
    dragImage.className = "bg-white p-3 rounded-lg shadow-md border border-blue-300";
    dragImage.innerHTML = `<div class="flex items-center gap-2">
      <div class="text-blue-500"></div>
      <span class="font-medium">${module.name}</span>
    </div>`;
    document.body.appendChild(dragImage);

    // Position it off-screen
    dragImage.style.position = "absolute";
    dragImage.style.top = "-1000px";

    // Set the drag image
    e.dataTransfer.setDragImage(dragImage, 20, 20);

    // Schedule removal of the element after drag starts
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-md ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-blue-500">
            <IconComponent size={18} />
          </div>
          <span className="font-medium">{module.name}</span>
        </div>
        {onRemove && (
          <button onClick={onRemove} className="text-gray-400 transition-colors hover:text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">{module.description}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-blue-600">${module.basePrice}/mo</span>
      </div>
    </div>
  );
};

export default ModuleCard;
