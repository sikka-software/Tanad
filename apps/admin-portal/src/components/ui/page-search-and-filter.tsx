import { Search, Plus, LayoutGrid, Table2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import * as React from "react";
import { StoreApi, useStore } from "zustand";

import { cn } from "@/lib/utils";

import { FilterableField, SortableColumn, FilterCondition } from "@/types/common.type";

import { Button } from "./button";
import FilterPopover from "./filter-popover";
import IconButton from "./icon-button";
import { Input } from "./input";
import SortPopover from "./sort-popover";

export interface PageSearchAndFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  store: StoreApi<{
    searchQuery: string;
    setSearchQuery: (searchQuery: string) => void;
    filterConditions: FilterCondition[];
    setFilterConditions: (filterConditions: FilterCondition[]) => void;
    filterCaseSensitive: boolean;
    setFilterCaseSensitive: (filterCaseSensitive: boolean) => void;
    viewMode: "table" | "cards";
    setViewMode: (viewMode: "table" | "cards") => void;
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (isDeleteDialogOpen: boolean) => void;
    sortRules: { field: string; direction: string }[];
    setSortRules: (sortRules: { field: string; direction: string }[]) => void;
    sortCaseSensitive: boolean;
    setSortCaseSensitive: (sortCaseSensitive: boolean) => void;
    sortNullsFirst: boolean;
    setSortNullsFirst: (sortNullsFirst: boolean) => void;
    clearSelection: () => void;
    setSelectedRows: (ids: string[]) => void;
  }>;
  title?: string;
  createHref?: string;
  createLabel?: string;
  searchPlaceholder?: string;
  sortableColumns: SortableColumn[];
  filterableFields?: FilterableField[];
}

const PageSearchAndFilter = ({
  store,
  className,
  title = "Items",
  createHref = "#",
  createLabel = "Create",
  searchPlaceholder = "Search...",
  sortableColumns,
  filterableFields,
  ...props
}: PageSearchAndFilterProps) => {
  const viewMode = useStore(store, (state) => state.viewMode);
  const setViewMode = useStore(store, (state) => state.setViewMode);
  const searchQuery = useStore(store, (state) => state.searchQuery);
  const setSearchQuery = useStore(store, (state) => state.setSearchQuery);
  const filterConditions = useStore(store, (state) => state.filterConditions);
  const onFilterConditionsChange = useStore(store, (state) => state.setFilterConditions);
  const filterCaseSensitive = useStore(store, (state) => state.filterCaseSensitive);
  const onFilterCaseSensitiveChange = useStore(store, (state) => state.setFilterCaseSensitive);
  const sortRules = useStore(store, (state) => state.sortRules);
  const onSortRulesChange = useStore(store, (state) => state.setSortRules);
  const sortCaseSensitive = useStore(store, (state) => state.sortCaseSensitive);
  const setSortCaseSensitive = useStore(store, (state) => state.setSortCaseSensitive);
  const sortNullsFirst = useStore(store, (state) => state.sortNullsFirst);
  const setSortNullsFirst = useStore(store, (state) => state.setSortNullsFirst);

  const t = useTranslations();
  return (
    <div
      className={cn(
        "bg-background sticky top-0 z-10 flex !min-h-12 items-center justify-between gap-4 border-b px-2",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 items-center gap-4">
        {title && <h2 className="hidden text-xl font-medium md:block">{title}</h2>}

        <div className="relative max-w-md flex-1">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="bg-muted/50 h-8 w-full ps-9 focus-visible:ring-1"
            onChange={(e) => setSearchQuery(e.target.value)}
            value={searchQuery}
          />
          <Search className="text-muted-foreground absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          icon={
            viewMode === "table" ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <Table2 className="h-4 w-4" />
            )
          }
          label={viewMode === "table" ? t("General.cards_view") : t("General.table_view")}
          onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
        />

        <FilterPopover
          fields={filterableFields}
          conditions={filterConditions}
          onConditionsChange={onFilterConditionsChange}
          caseSensitive={filterCaseSensitive}
          onCaseSensitiveChange={onFilterCaseSensitiveChange}
        />
        <SortPopover
          columns={sortableColumns}
          sortRules={sortRules}
          onSortRulesChange={onSortRulesChange}
          caseSensitive={sortCaseSensitive}
          onCaseSensitiveChange={setSortCaseSensitive}
          nullsFirst={sortNullsFirst}
          onNullsFirstChange={setSortNullsFirst}
        />

        <Link href={createHref} className="flex items-center">
          <Button size="sm" className="h-8">
            <Plus className="me-1 h-4 w-4" />
            <span>{createLabel}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default PageSearchAndFilter;
