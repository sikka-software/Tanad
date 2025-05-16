import { FilterableField, SortableColumn } from "@/types/common.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Metadata.created_at.label", type: "date" },
  { id: "name", translationKey: "Vendors.form.name.label", type: "text" },
  { id: "email", translationKey: "Vendors.form.email.label", type: "text" },
  { id: "phone", translationKey: "Vendors.form.phone.label", type: "text" },
];

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Metadata.created_at.label" },
  { value: "name", translationKey: "Vendors.form.name.label" },
  { value: "email", translationKey: "Vendors.form.email.label" },
  { value: "phone", translationKey: "Vendors.form.phone.label" },
  { value: "company", translationKey: "Vendors.form.company.label" },
  { value: "address", translationKey: "Vendors.form.address.label" },
  { value: "city", translationKey: "Vendors.form.city.label" },
  { value: "state", translationKey: "Vendors.form.state.label" },
  { value: "zip_code", translationKey: "Vendors.form.zip_code.label" },
];
