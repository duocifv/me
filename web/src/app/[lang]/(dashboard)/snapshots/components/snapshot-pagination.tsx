"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useHydroponicsStore } from "@adapter/hydroponics/hydroponics.store";

export function SnapshotPagination() {
  const { meta } = useHydroponicsStore((s) => s.snapshots);
  const setFilters = useHydroponicsStore((s) => s.setFilters);

  const { totalPages, currentPage } = meta;
  const goToPage = (page: number) => {
    setFilters({ page, limit: 10 });
  };
  const pages = React.useMemo(
    () => Array.from({ length: meta.totalPages }, (_, i) => i + 1),
    [meta.totalPages]
  );

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <button
            disabled={currentPage <= 1}
            className="disabled:opacity-50"
            onClick={() => currentPage > 1 && goToPage(1)}
          >
            <PaginationPrevious />
          </button>
        </PaginationItem>

        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              href="#"
              isActive={page === currentPage}
              onClick={(e) => {
                e.preventDefault();
                if (page !== currentPage) goToPage(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        <PaginationItem>
          <button
            disabled={currentPage >= totalPages}
            className="disabled:opacity-50"
            onClick={() =>
              currentPage < totalPages && goToPage(currentPage + 1)
            }
          >
            <PaginationNext />
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
