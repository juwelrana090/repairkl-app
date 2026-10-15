"use client";

import AdminButton from "./Button";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Reference Pagination: Previous/Next outlined buttons around numbered page squares; current page is brand-filled. */
export default function AdminPagination({ currentPage, totalPages, onPageChange }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const pages = Array.from({ length: Math.min(3, totalPages) }, (_, i) => start + i);

  return (
    <nav className="flex items-center justify-center gap-2.5" aria-label="Pagination">
      <AdminButton variant="outline" size="sm" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        Previous
      </AdminButton>
      <div className="flex items-center gap-1.5">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-sm font-medium transition ${
              page === currentPage ? "bg-[#034795] text-white" : "text-[#3d4766] hover:bg-[#eaf0f8] hover:text-[#034795]"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      <AdminButton variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        Next
      </AdminButton>
    </nav>
  );
}
