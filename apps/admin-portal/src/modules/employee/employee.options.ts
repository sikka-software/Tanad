import { FilterableField, SortableColumn } from "@/types/common.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Forms.created_at.label", type: "date" },
];

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Forms.created_at.label" },
];

export const SALARY_COMPONENT_TYPES = [
  { value: "base", label: "Base Pay" },
  { value: "housing", label: "Housing Allowance" },
  { value: "transportation", label: "Transportation Allowance" },
  { value: "bonus", label: "Bonus" },
  { value: "commission", label: "Commission" },
  { value: "other", label: "Other" },
] as const;
