"use client";

import { Filter, Plus, Trash2, Save, Clock, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import IconButton from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define filter operators for different field types
const TEXT_OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "contains", label: "Contains" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "isEmpty", label: "Is empty" },
  { value: "isNotEmpty", label: "Is not empty" },
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

// Define field types
const FIELDS = [
  { id: "name", label: "Name", type: "text" },
  { id: "email", label: "Email", type: "text" },
  { id: "phone", label: "Phone", type: "text" },
  { id: "address", label: "Address", type: "text" },
  { id: "city", label: "City", type: "text" },
  { id: "region", label: "Region", type: "text" },
  { id: "postalCode", label: "Postal Code", type: "text" },
  { id: "createdAt", label: "Created Date", type: "date" },
  { id: "lastOrder", label: "Last Order", type: "date" },
  { id: "orderCount", label: "Order Count", type: "number" },
  { id: "totalSpent", label: "Total Spent", type: "number" },
];

// Saved filter presets
const SAVED_FILTERS = [
  { id: 1, name: "High Value Customers", conditions: [] },
  { id: 2, name: "Recent Customers", conditions: [] },
  { id: 3, name: "Inactive Customers", conditions: [] },
];

export default function FilterPopover() {
  const t = useTranslations();
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [filterConditions, setFilterConditions] = useState([
    { id: 1, field: "name", operator: "contains", value: "", type: "text", conjunction: "and" },
  ]);
  const [activeTab, setActiveTab] = useState("filters");

  const getOperatorsForField = (fieldId: string) => {
    const field = FIELDS.find((f) => f.id === fieldId);
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

  const getFieldType = (fieldId: string) => {
    const field = FIELDS.find((f) => f.id === fieldId);
    return field?.type || "text";
  };

  const addFilterCondition = () => {
    const newId = Math.max(0, ...filterConditions.map((c) => c.id)) + 1;
    const newCondition = {
      id: newId,
      field: "name",
      operator: "contains",
      value: "",
      type: "text",
      conjunction: "and",
    };
    setFilterConditions([...filterConditions, newCondition]);
  };

  const removeFilterCondition = (id: number) => {
    setFilterConditions(filterConditions.filter((condition) => condition.id !== id));
  };

  const updateFilterCondition = (id: number, field: string, value: string) => {
    setFilterConditions(
      filterConditions.map((condition) => {
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

          return updatedCondition;
        }
        return condition;
      }),
    );
  };

  const applyFilters = () => {
    // Filter out conditions with empty values unless operator is isEmpty/isNotEmpty
    const validConditions = filterConditions.filter(
      (c) => c.value !== "" || c.operator === "isEmpty" || c.operator === "isNotEmpty",
    );

    console.log("Applying filters:", validConditions);
    setActiveFilters(validConditions.length);
    setOpen(false);
  };

  const resetFilters = () => {
    setFilterConditions([
      { id: 1, field: "name", operator: "contains", value: "", type: "text", conjunction: "and" },
    ]);
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
          placeholder="Value"
          className="mt-2"
          value={value}
          onChange={(e) => updateFilterCondition(id, "value", e.target.value)}
        />
      );
    }

    return (
      <Input
        type="text"
        placeholder="Value"
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
          <IconButton icon={<Filter className="h-4 w-4" />} label={t("General.filter")} />
        </PopoverTrigger>
        <PopoverContent className="w-96" align="end" dir={locale === "ar" ? "rtl" : "ltr"}>
          <Tabs defaultValue="filters" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 grid grid-cols-2">
              <TabsTrigger value="filters">Custom Filters</TabsTrigger>
              <TabsTrigger value="saved">Saved Filters</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="leading-none font-medium">Filter Options</h4>
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
                        <Label>Field</Label>
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
                            {FIELDS.map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Operator</Label>
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
                                {op.label}
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
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add filter condition
              </Button>

              <div className="flex items-center space-x-2">
                <Switch id="case-sensitive" />
                <Label htmlFor="case-sensitive">Case sensitive</Label>
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
                    className="mr-2 h-4 w-4"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  Reset All
                </Button>
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="leading-none font-medium">Saved Filters</h4>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Save Current
                </Button>
              </div>

              <div className="space-y-2">
                {SAVED_FILTERS.map((filter) => (
                  <div
                    key={filter.id}
                    className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-md p-2"
                    onClick={() => {
                      console.log(`Loading saved filter: ${filter.name}`);
                      // In a real app, we would load the filter conditions here
                      setActiveTab("filters");
                    }}
                  >
                    <div className="flex items-center">
                      <Clock className="text-muted-foreground mr-2 h-4 w-4" />
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
                          <Check className="mr-2 h-4 w-4" />
                          <span>Apply</span>
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
                            className="mr-2 h-4 w-4"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
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
