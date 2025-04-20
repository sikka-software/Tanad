import { FilterableField, SortableColumn } from "@/types/common.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Forms.created_at.label", type: "date" },
  { id: "expense_number", translationKey: "Expenses.form.expense_number.label", type: "text" },
  { id: "issue_date", translationKey: "Expenses.form.issue_date.label", type: "date" },
  { id: "due_date", translationKey: "Expenses.form.due_date.label", type: "date" },
  { id: "status", translationKey: "Expenses.form.status.label", type: "text" },
  { id: "amount", translationKey: "Expenses.form.amount.label", type: "number" },
  { id: "category", translationKey: "Expenses.form.category.label", type: "text" },
];

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Forms.created_at.label" },
  { value: "expense_number", translationKey: "Expenses.form.expense_number.label" },
  { value: "issue_date", translationKey: "Expenses.form.issue_date.label" },
  { value: "due_date", translationKey: "Expenses.form.due_date.label" },
  { value: "status", translationKey: "Expenses.form.status.label" },
  { value: "amount", translationKey: "Expenses.form.amount.label" },
  { value: "category", translationKey: "Expenses.form.category.label" },
];
