"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";

export interface TableColumn<T> {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  caption?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filter criteria.",
  emptyAction,
  caption,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
          <Inbox className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
          {emptyTitle}
        </h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
          {emptyDescription}
        </p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="border-b border-slate-100 bg-sky-50/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn("px-4 py-3.5 whitespace-nowrap", col.headerClassName)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              className="transition-colors hover:bg-sky-50/40 dark:hover:bg-slate-800/40"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3.5 align-middle text-slate-700 dark:text-slate-200",
                    col.className
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 dark:border-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{start}</span> to{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{end}</span> of{" "}
        <span className="font-semibold text-slate-700 dark:text-slate-200">{totalItems}</span> records
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          icon={<ChevronLeft className="h-4 w-4" />}
        >
          Prev
        </Button>
        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition-colors cursor-pointer",
              page === currentPage
                ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
          >
            {page}
          </button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
