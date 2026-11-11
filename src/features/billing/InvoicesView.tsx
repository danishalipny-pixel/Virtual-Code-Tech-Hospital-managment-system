"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Eye,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDisplayDate } from "@/lib/date";
import type { Invoice } from "@/lib/types";
import { INVOICE_STATUSES } from "./invoice-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Pagination, type TableColumn } from "@/components/ui/Table";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InvoiceFormModal } from "./InvoiceFormModal";

const PAGE_SIZE = 7;

export function InvoicesView() {
  const invoices = useHospitalStore((s) => s.invoices);
  const toggleInvoiceStatus = useHospitalStore((s) => s.toggleInvoiceStatus);
  const deleteInvoice = useHospitalStore((s) => s.deleteInvoice);
  const pushToast = useHospitalStore((s) => s.pushToast);
  const { canDeleteInvoices } = useRoleAccess();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  const totals = useMemo(() => {
    const paid = invoices
      .filter((i) => i.status === "Paid")
      .reduce((sum, i) => sum + i.totalAmount, 0);
    const unpaid = invoices
      .filter((i) => i.status === "Unpaid")
      .reduce((sum, i) => sum + i.totalAmount, 0);
    return { paid, unpaid, total: paid + unpaid };
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices
      .filter((inv) => {
        const matchesSearch =
          !q ||
          inv.id.toLowerCase().includes(q) ||
          inv.patientName.toLowerCase().includes(q) ||
          inv.serviceDescription.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "ALL" || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
  }, [invoices, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const hasFilters = search.trim() !== "" || statusFilter !== "ALL";

  const handleExportCsv = () => {
    downloadCsv("medaxis-invoices.csv", filtered, [
      { header: "Invoice Number", accessor: (i) => i.id },
      { header: "Patient Name", accessor: (i) => i.patientName },
      { header: "Service Description", accessor: (i) => i.serviceDescription },
      { header: "Quantity", accessor: (i) => i.quantity },
      { header: "Unit Price", accessor: (i) => i.unitPrice },
      { header: "Total Amount", accessor: (i) => i.totalAmount },
      { header: "Invoice Date", accessor: (i) => i.invoiceDate },
      { header: "Payment Status", accessor: (i) => i.status },
    ]);
    pushToast({
      type: "info",
      title: "Invoices exported",
      message: `Downloaded ${filtered.length} invoices as CSV.`,
    });
  };

  const columns: TableColumn<Invoice>[] = [
    {
      key: "id",
      header: "Invoice #",
      render: (inv) => (
        <Link
          href={`/billing/${inv.id}`}
          className="font-mono text-xs font-bold text-sky-700 hover:underline dark:text-sky-400"
        >
          {inv.id}
        </Link>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (inv) => (
        <Link
          href={`/patients/${inv.patientId}`}
          className="font-semibold text-slate-900 hover:text-sky-700 hover:underline dark:text-slate-100"
        >
          {inv.patientName}
        </Link>
      ),
    },
    {
      key: "service",
      header: "Service Description",
      render: (inv) => (
        <div className="max-w-xs">
          <p className="truncate font-medium text-slate-800 dark:text-slate-200">
            {inv.serviceDescription}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {inv.quantity} × {formatCurrency(inv.unitPrice)}
          </p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Invoice Date",
      render: (inv) => (
        <span className="text-xs whitespace-nowrap">
          {formatDisplayDate(inv.invoiceDate)}
        </span>
      ),
    },
    {
      key: "total",
      header: "Total Amount",
      render: (inv) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {formatCurrency(inv.totalAmount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Payment Status",
      render: (inv) => (
        <button
          type="button"
          onClick={() => {
            toggleInvoiceStatus(inv.id);
            pushToast({
              type: "info",
              title: "Payment status updated",
              message: `${inv.id} marked as ${inv.status === "Paid" ? "Unpaid" : "Paid"}.`,
            });
          }}
          title="Click to toggle Paid / Unpaid"
          className="cursor-pointer"
        >
          <Badge status={inv.status}>{inv.status}</Badge>
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (inv) => (
        <div className="inline-flex items-center justify-end gap-1">
          <Link href={`/billing/${inv.id}`}>
            <button
              type="button"
              title="View & Print Invoice"
              aria-label={`View invoice ${inv.id}`}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </button>
          </Link>
          <Link href={`/billing/${inv.id}?print=1`}>
            <button
              type="button"
              title="Print / Export PDF"
              aria-label={`Print invoice ${inv.id}`}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
            </button>
          </Link>
          <button
            type="button"
            title="Edit Invoice"
            aria-label={`Edit invoice ${inv.id}`}
            onClick={() => {
              setEditingInvoice(inv);
              setModalOpen(true);
            }}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          {canDeleteInvoices && (
            <button
              type="button"
              title="Delete Invoice"
              aria-label={`Delete invoice ${inv.id}`}
              onClick={() => setDeleteTarget(inv)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/60 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Billing & Medical Invoices
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create invoices, toggle payment status, export CSV, or print PDF statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingInvoice(null);
              setModalOpen(true);
            }}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Billing Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total Billed
            </span>
            <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(totals.total)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Collected (Paid)
            </span>
            <p className="mt-1.5 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(totals.paid)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
              Outstanding (Unpaid)
            </span>
            <p className="mt-1.5 text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(totals.unpaid)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-8">
              <label htmlFor="invoice-search" className="sr-only">
                Search invoices
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="invoice-search"
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by invoice number (INV-4001), patient name, or service..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-2">
              <label htmlFor="invoice-status-filter" className="sr-only">
                Filter by payment status
              </label>
              <select
                id="invoice-status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Payment Statuses</option>
                {INVOICE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setPage(1);
                  }}
                  icon={<X className="h-4 w-4" />}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices Ledger ({filtered.length})</CardTitle>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            Click any status badge to toggle Paid / Unpaid
          </span>
        </CardHeader>
        <DataTable
          caption="Hospital invoices table"
          columns={columns}
          data={paginated}
          rowKey={(i) => i.id}
          emptyTitle="No invoices found"
          emptyDescription="Create a new invoice or reset your payment filters."
        />
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>

      <InvoiceFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingInvoice(null);
        }}
        editingInvoice={editingInvoice}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteInvoice(deleteTarget.id);
          pushToast({
            type: "warning",
            title: "Invoice deleted",
            message: `${deleteTarget.id} removed from ledger.`,
          });
        }}
        title="Delete Invoice?"
        message={
          deleteTarget
            ? `Delete invoice ${deleteTarget.id} for ${deleteTarget.patientName} (${formatCurrency(deleteTarget.totalAmount)})?`
            : ""
        }
        confirmLabel="Delete Invoice"
      />
    </div>
  );
}
