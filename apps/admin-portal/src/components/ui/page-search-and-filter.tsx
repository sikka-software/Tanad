import {
  Search,
  Filter,
  ChevronDown,
  SlidersHorizontal,
  Plus,
  LayoutGrid,
  Table2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import IconButton from "./icon-button";
import { Input } from "./input";
import SortPopover from "./sort-popover";

export interface PageSearchAndFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  onSearch?: (value: string) => void;
  title?: string;
  createHref?: string;
  createLabel?: string;
  searchPlaceholder?: string;
  viewMode?: "table" | "cards";
  onViewModeChange?: (mode: "table" | "cards") => void;
  sortRules: { field: string; direction: string }[];
  onSortRulesChange: (sortRules: { field: string; direction: string }[]) => void;
}

const PageSearchAndFilter = ({
  className,
  onSearch,
  title = "Items",
  createHref = "#",
  createLabel = "Create",
  searchPlaceholder = "Search...",
  viewMode = "table",
  onViewModeChange,
  sortRules,
  onSortRulesChange,
  ...props
}: PageSearchAndFilterProps) => {
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
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <Search className="text-muted-foreground absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onViewModeChange && (
          <IconButton
            icon={
              viewMode === "table" ? (
                <LayoutGrid className="h-4 w-4" />
              ) : (
                <Table2 className="h-4 w-4" />
              )
            }
            label={viewMode === "table" ? t("General.cards_view") : t("General.table_view")}
            onClick={() => onViewModeChange(viewMode === "table" ? "cards" : "table")}
          />
        )}

        <IconButton
          icon={<Filter className="h-4 w-4" />}
          label={t("General.filter")}
          onClick={() => {}}
        />

        <SortPopover sortRules={sortRules} onSortRulesChange={onSortRulesChange} />

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
