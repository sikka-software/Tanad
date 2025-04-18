"use client";

import { ArrowDownAZ, ArrowDownZA, ArrowUpDown, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import IconButton from "./icon-button";

export default function SortPopover() {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [sortRules, setSortRules] = useState([{ field: "name", direction: "asc" }]);

  const addSortRule = () => {
    setSortRules([...sortRules, { field: "name", direction: "asc" }]);
  };

  const removeSortRule = (index: number) => {
    setSortRules(sortRules.filter((_, i) => i !== index));
  };

  const updateSortRule = (index: number, field: string, value: string) => {
    const newRules = [...sortRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setSortRules(newRules);
  };

  const applySort = () => {
    console.log("Applying sort:", sortRules);
    setOpen(false);
  };

  const resetSort = () => {
    setSortRules([{ field: "name", direction: "asc" }]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton icon={<ArrowUpDown className="h-4 w-4" />} label={t("General.sort")} />
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <h4 className="leading-none font-medium">{t("General.sort_options")}</h4>
          </div>

          <div className="grid gap-3">
            {sortRules.map((rule, index) => (
              <div key={index} className="grid gap-2">
                {index > 0 && <Separator className="my-1" />}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {t("General.rule")} {index + 1}
                  </span>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => removeSortRule(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">{t("General.remove")}</span>
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Select
                    value={rule.field}
                    onValueChange={(value) => updateSortRule(index, "field", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("General.select_field")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">{t("General.name")}</SelectItem>
                      <SelectItem value="email">{t("General.email")}</SelectItem>
                      <SelectItem value="phone">{t("General.phone")}</SelectItem>
                      <SelectItem value="address">{t("General.address")}</SelectItem>
                      <SelectItem value="city">{t("General.city")}</SelectItem>
                      <SelectItem value="region">{t("General.region")}</SelectItem>
                      <SelectItem value="postalCode">{t("General.postal_code")}</SelectItem>
                    </SelectContent>
                  </Select>

                  <RadioGroup
                    className="flex items-center gap-2"
                    value={rule.direction}
                    onValueChange={(value) => updateSortRule(index, "direction", value)}
                  >
                    <div
                      className={`rounded-md border p-1 ${rule.direction === "asc" ? "bg-muted" : ""}`}
                    >
                      <RadioGroupItem value="asc" id={`asc-${index}`} className="sr-only" />
                      <Label htmlFor={`asc-${index}`} className="cursor-pointer">
                        <ArrowDownAZ className="h-4 w-4" />
                      </Label>
                    </div>
                    <div
                      className={`rounded-md border p-1 ${rule.direction === "desc" ? "bg-muted" : ""}`}
                    >
                      <RadioGroupItem value="desc" id={`desc-${index}`} className="sr-only" />
                      <Label htmlFor={`desc-${index}`} className="cursor-pointer">
                        <ArrowDownZA className="h-4 w-4" />
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-muted-foreground mt-1 justify-start text-sm"
            onClick={addSortRule}
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            {t("General.add_another_rule")}
          </Button>

          <div className="flex items-center space-x-2">
            <Switch id="case-sensitive" />
            <Label htmlFor="case-sensitive">{t("General.case_sensitive")}</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="null-first" />
            <Label htmlFor="null-first">{t("General.show_empty_values_first")}</Label>
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
                className="mr-2 h-4 w-4"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              {t("General.reset_all")}
            </Button>
            <Button onClick={applySort} className="flex-1">
              {t("General.apply_sort")}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
