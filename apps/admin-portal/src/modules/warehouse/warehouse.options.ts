import { FilterableField, SortableColumn } from "@/types/common.type";

import { Warehouse } from "./warehouse.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Metadata.created_at.label", type: "date" },
];

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Metadata.created_at.label" },
];

export const COLUMN_VISIBILITY: Partial<Record<keyof Warehouse, boolean>> = {
  city: false,
  region: false,
  zip_code: false,
};
