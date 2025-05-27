import { create } from "zustand";
import { createGenericStore } from "@/utils/generic-store";

import { COLUMN_VISIBILITY } from "./document.options";
import { Document } from "./document.type";

interface UrlCache {
  url: string;
  expiresAt: number;
}

interface UrlCacheStore {
  urlCache: Record<string, UrlCache>;
  cacheUrl: (documentId: string, url: string, expiresIn: number) => void;
  getCachedUrl: (documentId: string) => string | null;
}

const searchDocumentFn = (document: Document, searchQuery: string) =>
  document.name.toLowerCase().includes(searchQuery.toLowerCase());

// Create the base document store
export const useDocumentStore = createGenericStore<Document>("documents", searchDocumentFn, {
  sortRules: [{ field: "created_at", direction: "asc" }],
  columnVisibility: COLUMN_VISIBILITY,
});

// Create a separate store for URL caching
export const useUrlCacheStore = create<UrlCacheStore>((set, get) => ({
  urlCache: {},
  cacheUrl: (documentId, url, expiresIn) => {
    const expiresAt = Date.now() + (expiresIn * 1000) - (5 * 60 * 1000); // 5 minutes buffer
    set((state) => ({
      ...state,
      urlCache: {
        ...state.urlCache,
        [documentId]: { url, expiresAt }
      }
    }));
  },
  getCachedUrl: (documentId) => {
    const cache = get().urlCache[documentId];
    if (cache && cache.expiresAt > Date.now()) {
      return cache.url;
    }
    return null;
  }
}));

// Export the base store as default for backward compatibility
export default useDocumentStore;
