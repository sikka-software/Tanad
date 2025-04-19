import { FilterableField, SortableColumn } from "@/types/common.type";

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "name", translationKey: "Companies.form.name.label" },
  { value: "created_at", translationKey: "Companies.form.created_at.label" },
  { value: "updated_at", translationKey: "Companies.form.updated_at.label" },
  { value: "is_active", translationKey: "Companies.form.is_active.label" },
  { value: "industry", translationKey: "Companies.form.industry.label" },
  { value: "size", translationKey: "Companies.form.size.label" },
  { value: "notes", translationKey: "Companies.form.notes.label" },
];

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Companies.form.created_at.label", type: "date" },
  { id: "name", translationKey: "Companies.form.name.label", type: "text" },
  { id: "email", translationKey: "Companies.form.email.label", type: "text" },
  { id: "phone", translationKey: "Companies.form.phone.label", type: "text" },
  { id: "website", translationKey: "Companies.form.website.label", type: "text" },
  { id: "address", translationKey: "Companies.form.address.label", type: "text" },
  { id: "city", translationKey: "Companies.form.city.label", type: "text" },
  { id: "state", translationKey: "Companies.form.state.label", type: "text" },
  { id: "zip_code", translationKey: "Companies.form.zip_code.label", type: "text" },
  { id: "industry", translationKey: "Companies.form.industry.label", type: "text" },
  { id: "size", translationKey: "Companies.form.size.label", type: "text" },
  { id: "notes", translationKey: "Companies.form.notes.label", type: "text" },
];
