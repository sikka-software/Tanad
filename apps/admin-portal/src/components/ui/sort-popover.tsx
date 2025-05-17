"use client";

import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Switch } from "@/ui/switch";

import { SortableColumn } from "@/types/common.type";

import IconButton from "./icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface SortPopoverProps {
  sortRules: { field: string; direction: "asc" | "desc" }[];
  onSortRulesChange: (sortRules: { field: string; direction: "asc" | "desc" }[]) => void;
  columns: SortableColumn[];
  caseSensitive?: boolean;
  onCaseSensitiveChange?: (value: boolean) => void;
  nullsFirst?: boolean;
  onNullsFirstChange?: (value: boolean) => void;
}

function SortPopover({
  sortRules,
  onSortRulesChange,
  columns,
  caseSensitive = false,
  onCaseSensitiveChange,
  nullsFirst = false,
  onNullsFirstChange,
}: SortPopoverProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const addSortRule = () => {
    if (sortRules.length < 3) {
      onSortRulesChange([...sortRules, { field: columns[0].value, direction: "asc" }]);
    }
  };

  const removeSortRule = (index: number) => {
    onSortRulesChange(sortRules.filter((_, i) => i !== index));
  };

  const updateSortRule = (index: number, field: string, value: string) => {
    const newRules = [...sortRules];
    newRules[index] = { ...newRules[index], [field]: value };
    onSortRulesChange(newRules);
  };

  const applySort = () => {
    setOpen(false);
  };

  const resetSort = () => {
    onSortRulesChange([{ field: columns[0].value, direction: "asc" }]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton icon={<ArrowUpDown className="h-4 w-4" />} label={t("General.sort")} />
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end" dir={locale === "ar" ? "rtl" : "ltr"}>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h4 className="leading-none font-medium">{t("General.sort_options")}</h4>
            {sortRules.length > 1 && (
              <span className="text-muted-foreground text-xs">
                {t("General.sort_priority_hint")}
              </span>
            )}
          </div>

          <div className="grid gap-3">
            {sortRules.map((rule, index) => (
              <div key={index} className="grid gap-2">
                {index > 0 && <Separator className="my-1" />}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {index === 0
                      ? t("General.primary_sort")
                      : index === 1
                        ? t("General.secondary_sort")
                        : t("General.tertiary_sort")}
                  </span>
                  {index > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => removeSortRule(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">{t("General.remove")}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t("General.remove_sort_rule")}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Select
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    value={rule.field}
                    onValueChange={(value) => updateSortRule(index, "field", value)}
                  >
                    <SelectTrigger isolated>
                      <SelectValue placeholder={t("General.select_field")} />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column.value} value={column.value}>
                          {t(column.translationKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <RadioGroup
                    className="flex items-center gap-2"
                    value={rule.direction}
                    onValueChange={(value) => updateSortRule(index, "direction", value)}
                  >
                    <div
                      className={`rounded-md border p-1 ${
                        rule.direction === "asc" ? "bg-muted" : ""
                      }`}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <RadioGroupItem value="asc" id={`asc-${index}`} className="sr-only" />
                            <Label htmlFor={`asc-${index}`} className="cursor-pointer">
                              <ArrowUpAZ className="h-4 w-4" />
                            </Label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t("General.ascending")}</TooltipContent>
                      </Tooltip>
                    </div>
                    <div
                      className={`rounded-md border p-1 ${
                        rule.direction === "desc" ? "bg-muted" : ""
                      }`}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <RadioGroupItem value="desc" id={`desc-${index}`} className="sr-only" />
                            <Label htmlFor={`desc-${index}`} className="cursor-pointer">
                              <ArrowDownAZ className="h-4 w-4" />
                            </Label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>{t("General.descending")}</TooltipContent>
                      </Tooltip>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>

          {sortRules.length < 3 && (
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground mt-1 justify-start text-sm"
              onClick={addSortRule}
            >
              <Plus className="me-1 h-3.5 w-3.5" />
              {t("General.add_another_rule")}
            </Button>
          )}

          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="case-sensitive"
                    checked={caseSensitive}
                    onCheckedChange={onCaseSensitiveChange}
                  />
                  <Label htmlFor="case-sensitive">{t("General.case_sensitive")}</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("General.case_sensitive_hint")}</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="null-first"
                    checked={nullsFirst}
                    onCheckedChange={onNullsFirstChange}
                  />
                  <Label htmlFor="null-first">{t("General.show_empty_values_first")}</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>{t("General.empty_values_hint")}</TooltipContent>
            </Tooltip>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSort} className="flex-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="me-2 h-4 w-4"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              {t("General.reset_all")}
            </Button>
            <Button onClick={applySort} className="flex-1">
              {t("General.done")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default SortPopover;
