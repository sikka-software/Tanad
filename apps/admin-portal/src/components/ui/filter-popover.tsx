"use client";

import { Filter, Plus, Trash2, Save, Clock, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import IconButton from "@/ui/icon-button";
import { Input } from "@/ui/inputs/input";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Switch } from "@/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { FilterCondition } from "@/types/common.type";

// Define filter operators for different field types
const TEXT_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
  { value: "starts_with", label: "Starts with" },
  { value: "ends_with", label: "Ends with" },
  { value: "is_empty", label: "Is empty" },
  { value: "is_not_empty", label: "Is not empty" },
];

const NUMBER_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "greaterThan", label: "Greater than" },
  { value: "lessThan", label: "Less than" },
  { value: "between", label: "Between" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

const DATE_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
  { value: "between", label: "Between" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
];

// Saved filter presets
const SAVED_FILTERS = [
  { id: 1, name: "High Value Customers", conditions: [] },
  { id: 2, name: "Recent Customers", conditions: [] },
  { id: 3, name: "Inactive Customers", conditions: [] },
];

interface FilterPopoverProps {
  fields?: Array<{
    id: string;
    translationKey: string;
    type: "text" | "number" | "date";
  }>;
  conditions?: FilterCondition[];
  onConditionsChange?: (conditions: FilterCondition[]) => void;
  caseSensitive?: boolean;
  onCaseSensitiveChange?: (value: boolean) => void;
}

export default function FilterPopover({
  fields = [],
  conditions: externalConditions,
  onConditionsChange,
  caseSensitive = false,
  onCaseSensitiveChange,
}: FilterPopoverProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(
    externalConditions || [
      {
        id: 1,
        field: fields[0]?.id || "name",
        operator: "contains",
        value: "",
        type: fields[0]?.type || "text",
        conjunction: "and",
      },
    ],
  );
  const [activeTab, setActiveTab] = useState("filters");

  const getOperatorsForField = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return TEXT_OPERATORS;

    switch (field.type) {
      case "number":
        return NUMBER_OPERATORS;
      case "date":
        return DATE_OPERATORS;
      default:
        return TEXT_OPERATORS;
    }
  };

  const getFieldType = (fieldId: string): "text" | "number" | "date" => {
    const field = fields.find((f) => f.id === fieldId);
    return field?.type || "text";
  };

  const addFilterCondition = () => {
    const newId = Math.max(0, ...filterConditions.map((c) => c.id)) + 1;
    const newCondition: FilterCondition = {
      id: newId,
      field: fields[0]?.id || "name",
      operator: "contains",
      value: "",
      type: fields[0]?.type || "text",
      conjunction: "and",
    };
    const newConditions = [...filterConditions, newCondition];
    setFilterConditions(newConditions);
    onConditionsChange?.(newConditions);
  };

  const removeFilterCondition = (id: number) => {
    const newConditions = filterConditions.filter((condition) => condition.id !== id);
    setFilterConditions(newConditions);
    onConditionsChange?.(newConditions);
  };

  const updateFilterCondition = (id: number, field: string, value: string) => {
    const newConditions = filterConditions.map((condition) => {
      if (condition.id === id) {
        const updatedCondition = { ...condition, [field]: value };

        // If field changed, update the operator and type
        if (field === "field") {
          const fieldType = getFieldType(value);
          updatedCondition.type = fieldType;

          // Set default operator based on field type
          switch (fieldType) {
            case "number":
              updatedCondition.operator = "equals";
              break;
            case "date":
              updatedCondition.operator = "equals";
              break;
            default:
              updatedCondition.operator = "contains";
          }

          // Reset value when changing field type
          updatedCondition.value = "";
        }

        // Ensure conjunction is always "and" or "or"
        if (field === "conjunction" && value !== "and" && value !== "or") {
          updatedCondition.conjunction = "and";
        }

        return updatedCondition as FilterCondition;
      }
      return condition;
    });

    setFilterConditions(newConditions);
    onConditionsChange?.(newConditions);
  };

  const applyFilters = () => {
    // Filter out conditions with empty values unless operator is isEmpty/isNotEmpty
    const validConditions = filterConditions.filter(
      (c) => c.value !== "" || c.operator === "isEmpty" || c.operator === "isNotEmpty",
    );

    setActiveFilters(validConditions.length);
    onConditionsChange?.(validConditions);
    setOpen(false);
  };

  const resetFilters = () => {
    const defaultConditions: FilterCondition[] = [
      {
        id: 1,
        field: fields[0]?.id || "name",
        operator: "contains",
        value: "",
        type: fields[0]?.type || "text",
        conjunction: "and",
      },
    ];
    setFilterConditions(defaultConditions);
    onConditionsChange?.(defaultConditions);
    setActiveFilters(0);
    setOpen(false);
    if (onCaseSensitiveChange) {
      onCaseSensitiveChange(false);
    }
  };

  const renderValueInput = (condition: any) => {
    const { type, operator, value, id } = condition;

    // No input needed for isEmpty/isNotEmpty operators
    if (operator === "isEmpty" || operator === "isNotEmpty") {
      return null;
    }

    if (type === "date") {
      return (
        <div className="mt-2">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => updateFilterCondition(id, "value", date ? date.toISOString() : "")}
            className="rounded-md border"
          />
        </div>
      );
    }

    if (operator === "between" && type === "number") {
      const [min, max] = value.split(",").map((v: string) => v.trim()) || ["", ""];
      return (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={min}
            onChange={(e) => updateFilterCondition(id, "value", `${e.target.value},${max}`)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={max}
            onChange={(e) => updateFilterCondition(id, "value", `${min},${e.target.value}`)}
          />
        </div>
      );
    }

    if (type === "number") {
      return (
        <Input
          type="number"
          placeholder={t("General.filter.value.placeholder")}
          className="mt-2"
          value={value}
          onChange={(e) => updateFilterCondition(id, "value", e.target.value)}
        />
      );
    }

    return (
      <Input
        type="text"
        placeholder={t("General.filter.value.placeholder")}
        className="mt-2"
        value={value}
        onChange={(e) => updateFilterCondition(id, "value", e.target.value)}
      />
    );
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <IconButton
            icon={<Filter className="h-4 w-4" />}
            label={t("General.filter.title")}
            badge={activeFilters > 0 ? activeFilters : undefined}
          />
        </PopoverTrigger>
        <PopoverContent className="w-96" align="end" dir={locale === "ar" ? "rtl" : "ltr"}>
          <Tabs defaultValue="filters" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid grid-cols-2">
              <TabsTrigger value="filters">{t("General.filter_options")}</TabsTrigger>
              <TabsTrigger value="saved">{t("General.saved_filters")}</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="leading-none font-medium">{t("General.filter_options")}</h4>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setActiveTab("saved")}
                  >
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {filterConditions.map((condition, index) => (
                  <div key={condition.id} className="space-y-2 border-b border-dashed pb-4">
                    {index > 0 && (
                      <div className="mb-2 flex items-center">
                        <Select
                          value={condition.conjunction}
                          onValueChange={(value) =>
                            updateFilterCondition(condition.id, "conjunction", value)
                          }
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="and">AND</SelectItem>
                            <SelectItem value="or">OR</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex-1" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeFilterCondition(condition.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>{t("General.field")}</Label>
                        <Select
                          value={condition.field}
                          onValueChange={(value) =>
                            updateFilterCondition(condition.id, "field", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fields.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {t(field.translationKey)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>{t("General.operator")}</Label>
                        <Select
                          value={condition.operator}
                          onValueChange={(value) =>
                            updateFilterCondition(condition.id, "operator", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperatorsForField(condition.field).map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {t(`General.operators.${op.value}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {renderValueInput(condition)}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-center text-sm"
                onClick={addFilterCondition}
              >
                <Plus className="me-1 h-3.5 w-3.5" />
                {t("General.add_filter_condition")}
              </Button>

              <div className="flex items-center space-x-2">
                <Switch
                  id="case-sensitive"
                  checked={caseSensitive}
                  onCheckedChange={onCaseSensitiveChange}
                />
                <Label htmlFor="case-sensitive">{t("General.case_sensitive")}</Label>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" onClick={resetFilters} className="flex-1">
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
                <Button onClick={applyFilters} className="flex-1">
                  {t("General.apply_filters")}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="relative space-y-4">
              <div className="bg-background/80 absolute inset-0 z-10 flex h-full w-full items-center justify-center">
                <div className="bg-background m-auto my-auto flex h-fit w-fit items-center justify-between rounded-md border p-4 text-4xl font-bold">
                  {t("General.soon")}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <h4 className="leading-none font-medium">{t("General.saved_filters")}</h4>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="me-1 h-3.5 w-3.5" />
                  {t("General.save_current_filter")}
                </Button>
              </div>

              <div className="space-y-2">
                {SAVED_FILTERS.map((filter) => (
                  <div
                    key={filter.id}
                    className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-md p-2"
                    onClick={() => {
                      // In a real app, we would load the filter conditions here
                      setActiveTab("filters");
                    }}
                  >
                    <div className="flex items-center">
                      <Clock className="text-muted-foreground me-2 h-4 w-4" />
                      <span>{filter.name}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
                          >
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Check className="me-2 h-4 w-4" />
                          <span>{t("General.apply_filter")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                          <span>{t("General.edit")}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="me-2 h-4 w-4" />
                          <span>{t("General.delete")}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
}
