import { FilterableField, SortableColumn } from "@/types/common.type";

import { Branch } from "./branch.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Metadata.created_at.label", type: "date" },
];

export const COLUMN_VISIBILITY: Partial<Record<keyof Branch, boolean>> = {
  city: false,
  region: false,
  zip_code: false,
};

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Metadata.created_at.label" },
];
