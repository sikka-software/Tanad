"use client";

import { RotateCcw } from "lucide-react";
import * as React from "react";

import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Slider } from "@/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/tooltip";

import { useSliderWithInput } from "@/hooks/use-slider-with-input";

interface SliderWithInputProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  label?: string;
  initialValue?: number[];
  defaultValue?: number[];
}

export default function SliderWithInput({
  value,
  onValueChange,
  minValue = 0,
  maxValue = 100,
  step = 1,
  label = "Value",
  defaultValue,
}: SliderWithInputProps) {
  const handleSliderChange = (value: number[]) => {
    onValueChange(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (isNaN(newValue)) return;

    const clampedValue = Math.min(Math.max(newValue, minValue), maxValue);
    onValueChange([clampedValue]);
  };

  const handleReset = () => {
    onValueChange([minValue]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium">{label}</label>
        <div className="mb-1 flex items-center gap-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  aria-label="Reset to default"
                  onClick={handleReset}
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="px-2 py-1 text-xs">Reset to default</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            value={value[0]}
            className="h-7 w-12 px-2 py-0"
            type="number"
            inputMode="decimal"
            onChange={handleInputChange}
            min={minValue}
            max={maxValue}
            step={step}
          />
        </div>
      </div>
      <Slider
        value={value}
        onValueChange={handleSliderChange}
        min={minValue}
        max={maxValue}
        step={step}
        className="w-full"
      />
    </div>
  );
}
