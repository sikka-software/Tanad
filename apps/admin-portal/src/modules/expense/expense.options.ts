import { FilterableField, SortableColumn } from "@/types/common.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Forms.created_at.label", type: "date" },
  { id: "expenseNumber", translationKey: "Expenses.form.expenseNumber.label", type: "text" },
  { id: "issueDate", translationKey: "Expenses.form.issueDate.label", type: "date" },
  { id: "dueDate", translationKey: "Expenses.form.dueDate.label", type: "date" },
  { id: "status", translationKey: "Expenses.form.status.label", type: "text" },
  { id: "amount", translationKey: "Expenses.form.amount.label", type: "number" },
  { id: "category", translationKey: "Expenses.form.category.label", type: "text" },
];

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Forms.created_at.label" },
  { value: "expenseNumber", translationKey: "Expenses.form.expenseNumber.label" },
  { value: "issueDate", translationKey: "Expenses.form.issueDate.label" },
  { value: "dueDate", translationKey: "Expenses.form.dueDate.label" },
  { value: "status", translationKey: "Expenses.form.status.label" },
  { value: "amount", translationKey: "Expenses.form.amount.label" },
  { value: "category", translationKey: "Expenses.form.category.label" },
];
