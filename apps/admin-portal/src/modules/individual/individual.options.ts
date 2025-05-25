import { FilterableField, SortableColumn } from "@/types/common.type";

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "General.created_at" },
  { value: "name", translationKey: "Individuals.form.name.label" },
  { value: "email", translationKey: "Individuals.form.email.label" },
  { value: "phone", translationKey: "Individuals.form.phone.label" },
  { value: "company", translationKey: "Individuals.form.company.label" },
  { value: "company_details.name", translationKey: "Individuals.form.company_name.label" },
  { value: "address", translationKey: "Individuals.form.address.label" },
  { value: "city", translationKey: "Individuals.form.city.label" },
  { value: "state", translationKey: "Individuals.form.state.label" },
  { value: "zip_code", translationKey: "Individuals.form.zip_code.label" },
];

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Individuals.form.created_at.label", type: "date" },
  { id: "name", translationKey: "Individuals.form.name.label", type: "text" },
  { id: "email", translationKey: "Individuals.form.email.label", type: "text" },
  { id: "phone", translationKey: "Individuals.form.phone.label", type: "text" },
  { id: "address", translationKey: "Individuals.form.address.label", type: "text" },
  { id: "city", translationKey: "Individuals.form.city.label", type: "text" },
  { id: "state", translationKey: "Individuals.form.state.label", type: "text" },
  { id: "zip_code", translationKey: "Individuals.form.zip_code.label", type: "text" },
];
