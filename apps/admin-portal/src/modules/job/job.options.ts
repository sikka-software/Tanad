import { FilterableField, SortableColumn } from "@/types/common.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "title", translationKey: "Jobs.form.title.label", type: "text" as const },
  { id: "description", translationKey: "Jobs.form.description.label", type: "text" as const },
  { id: "salary", translationKey: "Jobs.form.salary.label", type: "text" as const },
  { id: "type", translationKey: "Jobs.form.type.label", type: "text" as const },
  { id: "created_at", translationKey: "Jobs.form.created_at.label", type: "date" as const },
  { id: "updated_at", translationKey: "Jobs.form.updated_at.label", type: "date" as const },
];

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Jobs.form.created_at.label" },
  { value: "total_positions", translationKey: "Jobs.form.total_positions.label" },
  { value: "occupied_positions", translationKey: "Jobs.form.occupied_positions.label" },
  { value: "title", translationKey: "Jobs.form.title.label" },
  { value: "description", translationKey: "Jobs.form.description.label" },
  { value: "requirements", translationKey: "Jobs.form.requirements.label" },
  { value: "location", translationKey: "Jobs.form.location.label" },
  { value: "department", translationKey: "Jobs.form.department.label" },
  { value: "type", translationKey: "Jobs.form.type.label" },
  { value: "salary", translationKey: "Jobs.form.salary.label" },
  { value: "status", translationKey: "Jobs.form.status.label" },
  { value: "start_date", translationKey: "Jobs.form.start_date.label" },
  { value: "end_date", translationKey: "Jobs.form.end_date.label" },
];
