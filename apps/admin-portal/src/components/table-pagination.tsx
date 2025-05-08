import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { usePagination } from "@/hooks/use-pagination";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay?: number;
  onPageChange?: (pageNumber: number) => void;
};

export default function TablePagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay = 5,
  onPageChange,
}: PaginationProps) {
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage,
    totalPages,
    paginationItemsToDisplay,
  });

  const handlePageLinkClick = (pageNumber: number, e: React.MouseEvent) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(pageNumber);
    }
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <Pagination>
      <PaginationContent>
        {/* First page button */}
        <PaginationItem>
          <PaginationLink
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            href={onPageChange && !isFirstPage ? "#" : isFirstPage ? undefined : `#/page/1`}
            aria-label="Go to first page"
            aria-disabled={isFirstPage || totalPages === 0 ? true : undefined}
            onClick={!isFirstPage && totalPages > 0 ? (e) => handlePageLinkClick(1, e) : undefined}
          >
            <ChevronFirstIcon className="rtl:rotate-180" size={16} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>

        {/* Previous page button */}
        <PaginationItem>
          <PaginationLink
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            href={
              onPageChange && !isFirstPage
                ? "#"
                : isFirstPage
                  ? undefined
                  : `#/page/${currentPage - 1}`
            }
            aria-label="Go to previous page"
            aria-disabled={isFirstPage || totalPages === 0 ? true : undefined}
            onClick={
              !isFirstPage && totalPages > 0
                ? (e) => handlePageLinkClick(currentPage - 1, e)
                : undefined
            }
          >
            <ChevronLeftIcon className="rtl:rotate-180" size={16} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>

        {/* Left ellipsis (...) */}
        {showLeftEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Page number links */}
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href={onPageChange ? "#" : `#/page/${page}`}
              isActive={page === currentPage}
              onClick={(e) => handlePageLinkClick(page, e)}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Right ellipsis (...) */}
        {showRightEllipsis && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Next page button */}
        <PaginationItem>
          <PaginationLink
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            href={
              onPageChange && !isLastPage
                ? "#"
                : isLastPage
                  ? undefined
                  : `#/page/${currentPage + 1}`
            }
            aria-label="Go to next page"
            aria-disabled={isLastPage || totalPages === 0 ? true : undefined}
            onClick={
              !isLastPage && totalPages > 0
                ? (e) => handlePageLinkClick(currentPage + 1, e)
                : undefined
            }
          >
            <ChevronRightIcon className="rtl:rotate-180" size={16} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>

        {/* Last page button */}
        <PaginationItem>
          <PaginationLink
            className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
            href={
              onPageChange && !isLastPage ? "#" : isLastPage ? undefined : `#/page/${totalPages}`
            }
            aria-label="Go to last page"
            aria-disabled={isLastPage || totalPages === 0 ? true : undefined}
            onClick={
              !isLastPage && totalPages > 0 ? (e) => handlePageLinkClick(totalPages, e) : undefined
            }
          >
            <ChevronLastIcon className="rtl:rotate-180" size={16} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
