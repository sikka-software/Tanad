import { FilterableField, SortableColumn } from "@/types/common.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Forms.created_at.label", type: "date" },
];

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Forms.created_at.label" },
];


// Define deduction types
export const DEDUCTION_TYPES = [
  { value: "absences", label: "Absences" },
  { value: "tax", label: "Tax" },
  { value: "insurance", label: "Insurance" },
  { value: "loan_payment", label: "Loan Payment" },
  { value: "advance_repayment", label: "Advance Repayment" },
  { value: "other", label: "Other" },
];
