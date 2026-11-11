import { z } from "zod";

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const GENDERS = ["Male", "Female", "Other"] as const;
export const PATIENT_STATUSES = ["Active", "Inpatient", "Discharged"] as const;

export const patientSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Full name must be at least 2 characters" })
    .max(80, { message: "Full name is too long" }),
  age: z
    .number({ error: "Enter a valid age" })
    .int({ message: "Age must be a whole number" })
    .min(0, { message: "Age cannot be negative" })
    .max(120, { message: "Age must be 120 or less" }),
  gender: z.enum(GENDERS, { error: "Select gender" }),
  phone: z
    .string()
    .trim()
    .min(7, { message: "Enter a valid phone number" })
    .max(30, { message: "Phone number is too long" }),
  email: z.email({ message: "Enter a valid email address" }),
  address: z
    .string()
    .trim()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(180, { message: "Address is too long" }),
  bloodGroup: z.enum(BLOOD_GROUPS, { error: "Select blood group" }),
  status: z.enum(PATIENT_STATUSES, { error: "Select status" }),
  emergencyContact: z.string().trim().max(100).optional(),
  medicalNotes: z.string().trim().max(500).optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
