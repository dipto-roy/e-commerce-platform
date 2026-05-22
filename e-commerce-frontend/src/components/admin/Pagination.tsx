'use client';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number; totalPages: number; totalItems: number;
  itemsPerPage: number; onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  loading?: boolean;
}

export default function Pagination({
  currentPage, totalPages, totalItems, itemsPerPage,
  onPageChange, onItemsPerPageChange, loading = false,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem   = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const show = 5;
    let start = Math.max(1, currentPage - Math.floor(show / 2));
    let end   = Math.min(totalPages, start + show - 1);
    if (end - start + 1 < show) start = Math.max(1, end - show + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = getPageNumbers();

  const PageBtn = ({ page }: { page: number }) => (
    <button onClick={() => onPageChange(page)} disabled={loading}
      className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline'}`}>
      {page}
    </button>
  );

  return (
    <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)]">
      {/* Info + items-per-page */}
      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span>
          {startItem}–{endItem} of <span className="font-medium">{totalItems}</span>
        </span>
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="ipp" className="text-xs">Show:</label>
            <select id="ipp" value={itemsPerPage}
              onChange={e => onItemsPerPageChange(Number(e.target.value))}
              disabled={loading} className="input" style={{ width: 'auto', paddingTop: '0.25rem', paddingBottom: '0.25rem' }}>
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Mobile prev/next */}
        <div className="flex gap-2 sm:hidden">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || loading}
            className="btn btn-outline btn-sm">← Prev</button>
          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || loading}
            className="btn btn-outline btn-sm">Next →</button>
        </div>

        {/* Desktop full nav */}
        <div className="hidden sm:flex items-center gap-1">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || loading}
            className="btn btn-outline btn-sm btn-icon">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages[0] > 1 && (
            <>
              <PageBtn page={1} />
              {pages[0] > 2 && <span className="text-sm px-1" style={{ color: 'var(--text-muted)' }}>…</span>}
            </>
          )}

          {pages.map(p => <PageBtn key={p} page={p} />)}

          {pages[pages.length - 1] < totalPages && (
            <>
              {pages[pages.length - 1] < totalPages - 1 && (
                <span className="text-sm px-1" style={{ color: 'var(--text-muted)' }}>…</span>
              )}
              <PageBtn page={totalPages} />
            </>
          )}

          <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || loading}
            className="btn btn-outline btn-sm btn-icon">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
