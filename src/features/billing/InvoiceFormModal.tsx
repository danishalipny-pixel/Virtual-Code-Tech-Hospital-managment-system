"use client";

import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  SelectInput,
  TextareaInput,
  TextInput,
} from "@/components/ui/FormFields";
import { useHospitalStore } from "@/store/useHospitalStore";
import { formatCurrency, getTodayIso } from "@/lib/date";
import {
  INVOICE_STATUSES,
  invoiceSchema,
  type InvoiceFormValues,
} from "./invoice-schema";
import type { Invoice } from "@/lib/types";

interface InvoiceFormModalProps {
  open: boolean;
  onClose: () => void;
  editingInvoice?: Invoice | null;
}

export function InvoiceFormModal({
  open,
  onClose,
  editingInvoice,
}: InvoiceFormModalProps) {
  const patients = useHospitalStore((s) => s.patients);
  const addInvoice = useHospitalStore((s) => s.addInvoice);
  const updateInvoice = useHospitalStore((s) => s.updateInvoice);
  const pushToast = useHospitalStore((s) => s.pushToast);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      patientId: patients[0]?.id ?? "",
      serviceDescription: "",
      quantity: 1,
      unitPrice: 200,
      invoiceDate: getTodayIso(),
      status: "Unpaid",
      notes: "",
    },
  });

  const watchedQty = useWatch({ control, name: "quantity" });
  const watchedPrice = useWatch({ control, name: "unitPrice" });
  const calculatedTotal =
    (Number.isFinite(watchedQty) ? watchedQty : 0) *
    (Number.isFinite(watchedPrice) ? watchedPrice : 0);

  useEffect(() => {
    if (!open) return;
    if (editingInvoice) {
      reset({
        patientId: editingInvoice.patientId,
        serviceDescription: editingInvoice.serviceDescription,
        quantity: editingInvoice.quantity,
        unitPrice: editingInvoice.unitPrice,
        invoiceDate: editingInvoice.invoiceDate,
        status: editingInvoice.status,
        notes: editingInvoice.notes ?? "",
      });
    } else {
      reset({
        patientId: patients[0]?.id ?? "",
        serviceDescription: "",
        quantity: 1,
        unitPrice: 200,
        invoiceDate: getTodayIso(),
        status: "Unpaid",
        notes: "",
      });
    }
  }, [open, editingInvoice, patients, reset]);

  const onSubmit = (values: InvoiceFormValues) => {
    if (editingInvoice) {
      updateInvoice(editingInvoice.id, values);
      pushToast({
        type: "success",
        title: "Invoice updated",
        message: `${editingInvoice.id} recalculated to ${formatCurrency(values.quantity * values.unitPrice)}.`,
      });
    } else {
      const created = addInvoice(values);
      pushToast({
        type: "success",
        title: "Invoice created",
        message: `${created.id} issued for ${created.patientName} (${formatCurrency(created.totalAmount)}).`,
      });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        editingInvoice
          ? `Edit Invoice · ${editingInvoice.id}`
          : "Create Hospital Invoice"
      }
      description="Total amount calculates automatically from quantity and unit price."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectInput
            label="Patient"
            required
            placeholder="Select a patient"
            options={patients.map((p) => ({
              label: `${p.fullName} (${p.id})`,
              value: p.id,
            }))}
            error={errors.patientId?.message}
            {...register("patientId")}
          />

          <TextInput
            label="Invoice Date"
            type="date"
            required
            error={errors.invoiceDate?.message}
            {...register("invoiceDate")}
          />
        </div>

        <TextInput
          label="Service Description"
          required
          placeholder="e.g., Cardiology Consultation & Diagnostic Echocardiogram"
          error={errors.serviceDescription?.message}
          {...register("serviceDescription")}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TextInput
            label="Quantity"
            type="number"
            required
            min={1}
            max={365}
            error={errors.quantity?.message}
            {...register("quantity", { valueAsNumber: true })}
          />
          <TextInput
            label="Unit Price ($)"
            type="number"
            required
            min={1}
            step="0.01"
            error={errors.unitPrice?.message}
            {...register("unitPrice", { valueAsNumber: true })}
          />
          <SelectInput
            label="Payment Status"
            required
            options={INVOICE_STATUSES.map((st) => ({ label: st, value: st }))}
            error={errors.status?.message}
            {...register("status")}
          />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-sky-200 bg-sky-50/70 px-4 py-3 dark:border-sky-800/70 dark:bg-sky-950/40">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wide text-sky-800 dark:text-sky-300">
              Calculated Total Amount
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {Number.isFinite(watchedQty) ? watchedQty : 0} ×{" "}
              {formatCurrency(Number.isFinite(watchedPrice) ? watchedPrice : 0)}
            </span>
          </div>
          <span className="text-xl font-bold text-sky-700 dark:text-sky-300">
            {formatCurrency(calculatedTotal)}
          </span>
        </div>

        <TextareaInput
          label="Billing Notes"
          placeholder="Insurance reference or ward stay details (optional)"
          error={errors.notes?.message}
          {...register("notes")}
        />

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {editingInvoice ? "Save Invoice" : "Generate Invoice"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
