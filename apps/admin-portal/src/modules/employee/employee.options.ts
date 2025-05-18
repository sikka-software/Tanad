import { FilterableField, SortableColumn } from "@/types/common.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Metadata.created_at.label", type: "date" },
  { id: "updated_at", translationKey: "Metadata.updated_at.label", type: "date" },
];

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Metadata.created_at.label" },
  { value: "updated_at", translationKey: "Metadata.updated_at.label" },
  { value: "first_name", translationKey: "Employees.form.first_name.label" },
  { value: "last_name", translationKey: "Employees.form.last_name.label" },
  { value: "email", translationKey: "Employees.form.email.label" },
  { value: "phone", translationKey: "Employees.form.phone.label" },
  { value: "address", translationKey: "Employees.form.address.label" },
  { value: "city", translationKey: "Employees.form.city.label" },
  { value: "state", translationKey: "Employees.form.state.label" },
];

export const SALARY_COMPONENT_TYPES = [
  { value: "base", label: "Base Pay" },
  { value: "housing", label: "Housing Allowance" },
  { value: "transportation", label: "Transportation Allowance" },
  { value: "bonus", label: "Bonus" },
  { value: "commission", label: "Commission" },
  { value: "other", label: "Other" },
] as const;
