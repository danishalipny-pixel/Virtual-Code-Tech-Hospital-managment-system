import { z } from "zod";

export const INVOICE_STATUSES = ["Paid", "Unpaid"] as const;

export const invoiceSchema = z.object({
  patientId: z.string().min(1, { message: "Select a patient" }),
  serviceDescription: z
    .string()
    .trim()
    .min(3, { message: "Enter service description" })
    .max(180),
  quantity: z
    .number({ error: "Enter valid quantity" })
    .int({ message: "Quantity must be a whole number" })
    .min(1, { message: "Quantity must be at least 1" })
    .max(365, { message: "Quantity cannot exceed 365" }),
  unitPrice: z
    .number({ error: "Enter valid unit price" })
    .min(1, { message: "Unit price must be at least $1" })
    .max(100000, { message: "Unit price cannot exceed $100,000" }),
  invoiceDate: z.string().min(10, { message: "Select invoice date" }),
  status: z.enum(INVOICE_STATUSES, { error: "Select payment status" }),
  notes: z.string().trim().max(300).optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
