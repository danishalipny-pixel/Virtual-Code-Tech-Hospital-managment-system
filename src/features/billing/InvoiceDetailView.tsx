"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Pencil, Printer } from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import { formatCurrency, formatDisplayDate } from "@/lib/date";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InvoiceFormModal } from "./InvoiceFormModal";

export function InvoiceDetailView() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const invoiceId = params?.id ?? "";

  const invoices = useHospitalStore((s) => s.invoices);
  const patients = useHospitalStore((s) => s.patients);
  const toggleInvoiceStatus = useHospitalStore((s) => s.toggleInvoiceStatus);
  const pushToast = useHospitalStore((s) => s.pushToast);

  const [editOpen, setEditOpen] = useState(false);
  const printedAutoRef = useRef(false);

  const invoice = invoices.find((i) => i.id === invoiceId);
  const patient = invoice
    ? patients.find((p) => p.id === invoice.patientId)
    : undefined;

  useEffect(() => {
    if (
      invoice &&
      searchParams.get("print") === "1" &&
      !printedAutoRef.current
    ) {
      printedAutoRef.current = true;
      const timer = window.setTimeout(() => {
        window.print();
      }, 300);
      return () => window.clearTimeout(timer);
    }
  }, [invoice, searchParams]);

  if (!invoice) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Invoice Not Found
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No invoice matching <span className="font-mono">{invoiceId}</span> exists.
          </p>
          <div className="mt-5">
            <Link href="/billing">
              <Button variant="primary" icon={<ArrowLeft className="h-4 w-4" />}>
                Back to Billing
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href="/billing">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
            All Invoices
          </Button>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<CheckCircle2 className="h-4 w-4" />}
            onClick={() => {
              toggleInvoiceStatus(invoice.id);
              pushToast({
                type: "info",
                title: "Status updated",
                message: `${invoice.id} is now ${invoice.status === "Paid" ? "Unpaid" : "Paid"}.`,
              });
            }}
          >
            Mark as {invoice.status === "Paid" ? "Unpaid" : "Paid"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Printer className="h-4 w-4" />}
            onClick={() => window.print()}
          >
            Print / Export PDF
          </Button>
        </div>
      </div>

      {/* Printable International Medical Invoice */}
      <Card className="print-container mx-auto max-w-3xl overflow-hidden">
        <CardContent className="p-6 sm:p-10">
          {/* Header */}
          <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-start dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Image
                src="/medaxis-logo.svg"
                alt="MedAxis HMS logo"
                width={44}
                height={44}
                className="h-11 w-11 rounded-xl"
              />
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  MedAxis International Medical Center
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  450 Medical Plaza Way, Boston, MA · billing@medaxis.org
                </p>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Billing Statement
              </p>
              <p className="mt-0.5 font-mono text-xl font-bold text-sky-700 dark:text-sky-400">
                {invoice.id}
              </p>
              <div className="mt-2">
                <Badge status={invoice.status}>{invoice.status}</Badge>
              </div>
            </div>
          </div>

          {/* Parties & Dates */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Billed To
              </p>
              <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                {invoice.patientName}
              </p>
              <p className="font-mono text-xs text-slate-500">
                Patient ID: {invoice.patientId}
              </p>
              {patient && (
                <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  <p>{patient.address}</p>
                  <p>
                    {patient.phone} · {patient.email}
                  </p>
                </div>
              )}
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Statement Details
              </p>
              <dl className="mt-1 space-y-1 text-sm">
                <div className="flex justify-between sm:justify-end sm:gap-4">
                  <dt className="text-slate-500">Invoice Date:</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">
                    {formatDisplayDate(invoice.invoiceDate)}
                  </dd>
                </div>
                <div className="flex justify-between sm:justify-end sm:gap-4">
                  <dt className="text-slate-500">Payment Status:</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white">
                    {invoice.status}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-sky-50/70 text-xs font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <th className="px-4 py-3">Service Description</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-slate-800 dark:text-slate-100">
                  <td className="px-4 py-4 font-medium">
                    {invoice.serviceDescription}
                  </td>
                  <td className="px-4 py-4 text-right">{invoice.quantity}</td>
                  <td className="px-4 py-4 text-right">
                    {formatCurrency(invoice.unitPrice)}
                  </td>
                  <td className="px-4 py-4 text-right font-bold">
                    {formatCurrency(invoice.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-end dark:border-slate-800">
            <div className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Notes & Disclaimer
              </p>
              <p className="mt-1">
                {invoice.notes ||
                  "Fictional demonstration statement generated by MedAxis HMS. Not an actual clinical or financial invoice."}
              </p>
            </div>

            <div className="min-w-56 space-y-2 rounded-2xl bg-sky-50/70 p-4 dark:bg-slate-900/70">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Hospital Admin Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between border-t border-sky-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-700 dark:text-white">
                <span>Total Due</span>
                <span className="text-sky-700 dark:text-sky-400">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <InvoiceFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        editingInvoice={invoice}
      />
    </div>
  );
}
