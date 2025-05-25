import { createGenericStore } from "@/utils/generic-store";

import { COLUMN_VISIBILITY } from "./document.options";
import { Document } from "./document.type";

const searchDocumentFn = (document: Document, searchQuery: string) =>
  document.name.toLowerCase().includes(searchQuery.toLowerCase());

const useDocumentStore = createGenericStore<Document>("documents", searchDocumentFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
  columnVisibility: COLUMN_VISIBILITY,
});

export default useDocumentStore;
