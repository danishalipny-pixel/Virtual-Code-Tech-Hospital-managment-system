import { z } from "zod";

export const APPOINTMENT_STATUSES = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const;

export const appointmentSchema = z.object({
  patientId: z.string().min(1, { message: "Select a patient" }),
  doctorId: z.string().min(1, { message: "Select a physician" }),
  department: z.string().min(2, { message: "Department is required" }),
  date: z.string().min(10, { message: "Select appointment date" }),
  time: z.string().min(4, { message: "Select appointment time" }),
  reason: z
    .string()
    .trim()
    .min(4, { message: "Enter reason for visit (at least 4 characters)" })
    .max(200),
  status: z.enum(APPOINTMENT_STATUSES, { error: "Select status" }),
  notes: z.string().trim().max(300).optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export const rescheduleSchema = z.object({
  date: z.string().min(10, { message: "Select new appointment date" }),
  time: z.string().min(4, { message: "Select new appointment time" }),
  notes: z.string().trim().max(300).optional(),
});

export type RescheduleFormValues = z.infer<typeof rescheduleSchema>;
