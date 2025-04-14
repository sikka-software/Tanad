import * as React from "react";

import Link from "next/link";

import { Search, Filter, ChevronDown, SlidersHorizontal, Plus, LayoutGrid, Table2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "./button";
import { Input } from "./input";

export interface PageSearchAndFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  onSearch?: (value: string) => void;
  title?: string;
  createHref?: string;
  createLabel?: string;
  searchPlaceholder?: string;
  viewMode?: "table" | "cards";
  onViewModeChange?: (mode: "table" | "cards") => void;
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
  ...props
}: PageSearchAndFilterProps) => {
  return (
    <div
      className={cn(
        "bg-background  sticky top-0 flex !min-h-14 items-center justify-between gap-4 border-b px-2",
        className,
      )}
      {...props}
    >
      {/* Left section: Title & Search */}
      <div className="flex flex-1 items-center gap-4">
        {title && <h2 className="hidden text-xl font-medium md:block">{title}</h2>}

        <div className="relative max-w-md flex-1">
          <Input
            type="text"
            placeholder={searchPlaceholder}
            className="bg-muted/50 h-9 w-full ps-9 focus-visible:ring-1"
            onChange={(e) => onSearch?.(e.target.value)}
          />
          <Search className="text-muted-foreground absolute top-1/2 start-3 h-4 w-4 -translate-y-1/2" />
        </div>
      </div>

      {/* Right section: View Toggle, Filters & Create Button */}
      <div className="flex items-center gap-2">
        {onViewModeChange && (
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => onViewModeChange(viewMode === "table" ? "cards" : "table")}
          >
            {viewMode === "table" ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <Table2 className="h-4 w-4" />
            )}
            <span className="sr-only">
              {viewMode === "table" ? "Switch to cards view" : "Switch to table view"}
            </span>
          </Button>
        )}

        <Button variant="outline" size="sm" className="h-9">
          <Filter className="me-2 h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          <ChevronDown className="ms-1 h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" className="h-9 px-2 sm:px-3">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>

        <Button size="sm" className="h-9">
          <Link href={createHref} className="flex items-center">
            <Plus className="me-1 h-4 w-4" />
            <span>{createLabel}</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default PageSearchAndFilter;
