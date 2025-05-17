import { FilterableField, SortableColumn } from "@/types/common.type";

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "email", translationKey: "Users.form.email.label" },
  { value: "role", translationKey: "Users.form.role.label" },
  { value: "created_at", translationKey: "Users.form.created_at.label" },
  { value: "updated_at", translationKey: "Users.form.updated_at.label" },
];

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "email", translationKey: "Users.form.email.label", type: "text" },
  //   { id: "role", translationKey: "Users.form.role.label", type: "select" },
  { id: "created_at", translationKey: "Users.form.created_at.label", type: "date" },
  { id: "updated_at", translationKey: "Users.form.updated_at.label", type: "date" },
];

export const ROLE_OPTIONS = [
  { value: "superadmin", label: "Superadmin" },
  { value: "accounting", label: "Accounting" },
  { value: "hr", label: "HR" },
];
