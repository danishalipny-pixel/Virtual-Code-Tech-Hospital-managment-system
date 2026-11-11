import { z } from "zod";

export const DOCTOR_AVAILABILITY_OPTIONS = [
  "Available",
  "In Consultation",
  "On Leave",
] as const;

export const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "General Medicine",
  "Dermatology",
  "Obstetrics & Gynecology",
  "Emergency Medicine",
  "Oncology",
] as const;

export const AVATAR_PRESETS = [
  "/avatars/doctor-1.svg",
  "/avatars/doctor-2.svg",
  "/avatars/doctor-3.svg",
  "/avatars/doctor-4.svg",
  "/avatars/doctor-5.svg",
  "/avatars/doctor-6.svg",
  "/avatars/doctor-7.svg",
  "/avatars/doctor-8.svg",
] as const;

export const doctorSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, { message: "Doctor name must be at least 3 characters" })
    .max(80),
  profileImage: z
    .string()
    .trim()
    .min(1, { message: "Select or enter a profile image path" }),
  specialization: z
    .string()
    .trim()
    .min(2, { message: "Select a medical specialization" }),
  department: z
    .string()
    .trim()
    .min(2, { message: "Enter department name" }),
  phone: z
    .string()
    .trim()
    .min(7, { message: "Enter a valid phone number" })
    .max(30),
  email: z.email({ message: "Enter a valid staff email address" }),
  experience: z
    .number({ error: "Enter years of experience" })
    .int({ message: "Experience must be a whole number" })
    .min(0, { message: "Experience cannot be negative" })
    .max(60, { message: "Experience must be 60 years or less" }),
  availability: z.enum(DOCTOR_AVAILABILITY_OPTIONS, {
    error: "Select availability status",
  }),
  consultationFee: z
    .number({ error: "Enter consultation fee" })
    .min(20, { message: "Fee must be at least $20" })
    .max(5000, { message: "Fee cannot exceed $5,000" }),
  qualifications: z.string().trim().max(120).optional(),
});

export type DoctorFormValues = z.infer<typeof doctorSchema>;
