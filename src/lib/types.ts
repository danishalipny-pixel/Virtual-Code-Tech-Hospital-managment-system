export type Role = "admin" | "doctor" | "receptionist";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  department?: string;
  doctorId?: string;
}

export interface UserAccount extends UserSession {
  password: string;
}

export type Gender = "Male" | "Female" | "Other";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export type PatientStatus = "Active" | "Inpatient" | "Discharged";

export interface Patient {
  id: string;
  fullName: string;
  age: number;
  gender: Gender;
  phone: string;
  email: string;
  address: string;
  bloodGroup: BloodGroup;
  emergencyContact?: string;
  medicalNotes?: string;
  status: PatientStatus;
  registeredAt: string;
}

export type DoctorAvailability = "Available" | "In Consultation" | "On Leave";

export interface Doctor {
  id: string;
  fullName: string;
  profileImage: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
  experience: number;
  availability: DoctorAvailability;
  consultationFee: number;
  qualifications?: string;
  scheduleDays?: string[];
}

export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}

export type InvoiceStatus = "Paid" | "Unpaid";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  serviceDescription: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  invoiceDate: string;
  status: InvoiceStatus;
  lineItems?: InvoiceLineItem[];
  notes?: string;
}

export type BedStatus = "Available" | "Occupied" | "Maintenance";

export interface Bed {
  id: string;
  bedNumber: string;
  wardId: string;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  admittedAt?: string;
}

export interface Ward {
  id: string;
  name: string;
  department: string;
  floor: string;
  beds: Bed[];
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastNotification {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export type ThemeMode = "light" | "dark";
