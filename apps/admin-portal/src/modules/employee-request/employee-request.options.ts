import { FilterableField, SortableColumn } from "@/types/common.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "title", translationKey: "EmployeeRequests.form.title.label", type: "text" },
  { id: "created_at", translationKey: "Metadata.created_at.label", type: "date" },
];

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Metadata.created_at.label" },
  { value: "title", translationKey: "EmployeeRequests.form.title.label" },
];
