import { FilterableField, SortableColumn } from "@/types/common.type";

import { Document } from "./document.type";

export const FILTERABLE_FIELDS: FilterableField[] = [
  { id: "created_at", translationKey: "Metadata.created_at.label", type: "date" },
];

export const SORTABLE_COLUMNS: SortableColumn[] = [
  { value: "created_at", translationKey: "Metadata.created_at.label" },
];

export const COLUMN_VISIBILITY: Partial<Record<keyof Document, boolean>> = {
  name: true,
  url: false,
  file_path: false,
  entity_id: false,
  entity_type: false,
  user_id: false,
  enterprise_id: false,
};
