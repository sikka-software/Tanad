import { FilterableField, SortableColumn } from "@/types/common.type";

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "name", translationKey: "Forms.name.label" },
  { value: "description", translationKey: "Forms.description.label" },
  { value: "created_at", translationKey: "Forms.created_at.label" },
  { value: "updated_at", translationKey: "Forms.updated_at.label" },
];

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "name", translationKey: "Forms.name.label", type: "text" },
  { id: "description", translationKey: "Forms.description.label", type: "text" },
  { id: "created_at", translationKey: "Forms.created_at.label", type: "date" },
];
