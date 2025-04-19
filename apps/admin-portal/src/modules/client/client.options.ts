import { FilterableField, SortableColumn } from "@/types/common.type";

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "General.created_at" },
  { value: "name", translationKey: "Clients.form.name.label" },
  { value: "email", translationKey: "Clients.form.email.label" },
  { value: "phone", translationKey: "Clients.form.phone.label" },
  { value: "company", translationKey: "Clients.form.company.label" },
  { value: "company_details.name", translationKey: "Clients.form.company_name.label" },
  { value: "address", translationKey: "Clients.form.address.label" },
  { value: "city", translationKey: "Clients.form.city.label" },
  { value: "state", translationKey: "Clients.form.state.label" },
  { value: "zip_code", translationKey: "Clients.form.zip_code.label" },
];

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Clients.form.created_at.label", type: "date" },
  { id: "name", translationKey: "Clients.form.name.label", type: "text" },
  { id: "email", translationKey: "Clients.form.email.label", type: "text" },
  { id: "phone", translationKey: "Clients.form.phone.label", type: "text" },
  { id: "address", translationKey: "Clients.form.address.label", type: "text" },
  { id: "city", translationKey: "Clients.form.city.label", type: "text" },
  { id: "state", translationKey: "Clients.form.state.label", type: "text" },
  { id: "zip_code", translationKey: "Clients.form.zip_code.label", type: "text" },
];
