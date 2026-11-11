"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import usersData from "@/data/users.json";
import patientsData from "@/data/patients.json";
import doctorsData from "@/data/doctors.json";
import appointmentsData from "@/data/appointments.json";
import invoicesData from "@/data/invoices.json";
import wardsData from "@/data/wards.json";
import {
  addDaysToIso,
  diffDaysBetweenIso,
  getTodayIso,
  SEED_ANCHOR_DATE,
} from "@/lib/date";
import type {
  Appointment,
  AppointmentStatus,
  BedStatus,
  Doctor,
  DoctorAvailability,
  Invoice,
  InvoiceStatus,
  Patient,
  ThemeMode,
  ToastNotification,
  ToastType,
  UserAccount,
  UserSession,
  Ward,
} from "@/lib/types";

function nextPrefixedId(existingIds: string[], prefix: string, startAt: number): string {
  const maxNum = existingIds.reduce((max, id) => {
    const match = id.match(/(\d+)$/);
    const num = match ? Number(match[1]) : 0;
    return num > max ? num : max;
  }, startAt - 1);
  return `${prefix}-${maxNum + 1}`;
}

export function buildSeedCollections(todayIso: string = getTodayIso()) {
  const deltaDays = diffDaysBetweenIso(SEED_ANCHOR_DATE, todayIso);

  const patients = (patientsData as Patient[]).map((p) => ({ ...p }));
  const doctors = (doctorsData as Doctor[]).map((d) => ({ ...d }));
  const appointments = (appointmentsData as Appointment[]).map((a) => ({
    ...a,
    date: deltaDays === 0 ? a.date : addDaysToIso(a.date, deltaDays),
  }));
  const invoices = (invoicesData as Invoice[]).map((inv) => ({
    ...inv,
    invoiceDate:
      deltaDays === 0 ? inv.invoiceDate : addDaysToIso(inv.invoiceDate, deltaDays),
  }));
  const wards = (wardsData as Ward[]).map((w) => ({
    ...w,
    beds: w.beds.map((b) => ({ ...b })),
  }));

  return { patients, doctors, appointments, invoices, wards };
}

export interface LoginResult {
  success: boolean;
  user?: UserSession;
  error?: string;
}

export interface HospitalState {
  session: UserSession | null;
  theme: ThemeMode;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  invoices: Invoice[];
  wards: Ward[];
  toasts: ToastNotification[];

  // Auth
  login: (email: string, password: string) => LoginResult;
  logout: () => void;

  // Theme
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Notifications
  pushToast: (toast: { type: ToastType; title: string; message?: string }) => void;
  dismissToast: (id: string) => void;

  // Patients CRUD
  addPatient: (
    payload: Omit<Patient, "id" | "registeredAt"> & { registeredAt?: string }
  ) => Patient;
  updatePatient: (id: string, updates: Partial<Omit<Patient, "id">>) => void;
  deletePatient: (id: string) => void;

  // Doctors CRUD
  addDoctor: (payload: Omit<Doctor, "id">) => Doctor;
  updateDoctor: (id: string, updates: Partial<Omit<Doctor, "id">>) => void;
  updateDoctorAvailability: (id: string, availability: DoctorAvailability) => void;
  deleteDoctor: (id: string) => void;

  // Appointments CRUD
  addAppointment: (
    payload: Omit<Appointment, "id" | "patientName" | "doctorName" | "department"> & {
      department?: string;
    }
  ) => Appointment;
  updateAppointment: (
    id: string,
    updates: Partial<Omit<Appointment, "id">>
  ) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;

  // Billing CRUD
  addInvoice: (
    payload: Omit<Invoice, "id" | "patientName" | "totalAmount">
  ) => Invoice;
  updateInvoice: (id: string, updates: Partial<Omit<Invoice, "id">>) => void;
  toggleInvoiceStatus: (id: string) => void;
  deleteInvoice: (id: string) => void;

  // Wards & Beds
  assignBedToPatient: (wardId: string, bedId: string, patientId: string) => void;
  dischargeBed: (wardId: string, bedId: string) => void;
  setBedMaintenance: (wardId: string, bedId: string, status: BedStatus) => void;

  // Demo Data Reset
  resetDemoData: () => void;
}

const initialSeed = buildSeedCollections();

export const useHospitalStore = create<HospitalState>()(
  persist(
    (set, get) => ({
      session: null,
      theme: "light",
      patients: initialSeed.patients,
      doctors: initialSeed.doctors,
      appointments: initialSeed.appointments,
      invoices: initialSeed.invoices,
      wards: initialSeed.wards,
      toasts: [],

      login: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const match = (usersData as UserAccount[]).find(
          (u) =>
            u.email.toLowerCase() === normalizedEmail && u.password === password
        );

        if (!match) {
          return {
            success: false,
            error: "Invalid email or password. Use one of the demo credentials below.",
          };
        }

        const session: UserSession = {
          id: match.id,
          name: match.name,
          email: match.email,
          role: match.role,
          title: match.title,
          department: match.department,
          doctorId: match.doctorId,
        };

        set({ session });
        get().pushToast({
          type: "success",
          title: `Welcome back, ${session.name}`,
          message: `Signed in with ${session.role.toUpperCase()} access.`,
        });
        return { success: true, user: session };
      },

      logout: () => {
        set({ session: null, toasts: [] });
      },

      setTheme: (theme) => {
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
        try {
          localStorage.setItem("theme", theme);
        } catch {
          // Ignore storage unavailability
        }
        set({ theme });
      },

      toggleTheme: () => {
        const next: ThemeMode = get().theme === "light" ? "dark" : "light";
        get().setTheme(next);
      },

      pushToast: ({ type, title, message }) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          toasts: [...state.toasts, { id, type, title, message }],
        }));
      },

      dismissToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },

      addPatient: (payload) => {
        const state = get();
        const newPatient: Patient = {
          ...payload,
          id: nextPrefixedId(
            state.patients.map((p) => p.id),
            "PAT",
            1001
          ),
          registeredAt: payload.registeredAt ?? getTodayIso(),
        };
        set({ patients: [newPatient, ...state.patients] });
        return newPatient;
      },

      updatePatient: (id, updates) => {
        set((state) => {
          const patients = state.patients.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          );
          const updated = patients.find((p) => p.id === id);
          const newName = updated?.fullName;
          return {
            patients,
            appointments: newName
              ? state.appointments.map((a) =>
                  a.patientId === id ? { ...a, patientName: newName } : a
                )
              : state.appointments,
            invoices: newName
              ? state.invoices.map((inv) =>
                  inv.patientId === id ? { ...inv, patientName: newName } : inv
                )
              : state.invoices,
            wards: newName
              ? state.wards.map((w) => ({
                  ...w,
                  beds: w.beds.map((b) =>
                    b.patientId === id ? { ...b, patientName: newName } : b
                  ),
                }))
              : state.wards,
          };
        });
      },

      deletePatient: (id) => {
        set((state) => ({
          patients: state.patients.filter((p) => p.id !== id),
          appointments: state.appointments.filter((a) => a.patientId !== id),
          wards: state.wards.map((w) => ({
            ...w,
            beds: w.beds.map((b) =>
              b.patientId === id
                ? {
                    id: b.id,
                    bedNumber: b.bedNumber,
                    wardId: b.wardId,
                    status: "Available",
                  }
                : b
            ),
          })),
        }));
      },

      addDoctor: (payload) => {
        const state = get();
        const newDoctor: Doctor = {
          ...payload,
          id: nextPrefixedId(
            state.doctors.map((d) => d.id),
            "DOC",
            201
          ),
        };
        set({ doctors: [newDoctor, ...state.doctors] });
        return newDoctor;
      },

      updateDoctor: (id, updates) => {
        set((state) => {
          const doctors = state.doctors.map((d) =>
            d.id === id ? { ...d, ...updates } : d
          );
          const updated = doctors.find((d) => d.id === id);
          return {
            doctors,
            appointments: updated
              ? state.appointments.map((a) =>
                  a.doctorId === id
                    ? {
                        ...a,
                        doctorName: updated.fullName,
                        department: updated.department,
                      }
                    : a
                )
              : state.appointments,
          };
        });
      },

      updateDoctorAvailability: (id, availability) => {
        set((state) => ({
          doctors: state.doctors.map((d) =>
            d.id === id ? { ...d, availability } : d
          ),
        }));
      },

      deleteDoctor: (id) => {
        set((state) => ({
          doctors: state.doctors.filter((d) => d.id !== id),
        }));
      },

      addAppointment: (payload) => {
        const state = get();
        const patient = state.patients.find((p) => p.id === payload.patientId);
        const doctor = state.doctors.find((d) => d.id === payload.doctorId);

        const newAppointment: Appointment = {
          id: nextPrefixedId(
            state.appointments.map((a) => a.id),
            "APT",
            3001
          ),
          patientId: payload.patientId,
          patientName: patient?.fullName ?? "Unknown Patient",
          doctorId: payload.doctorId,
          doctorName: doctor?.fullName ?? "Assigned Physician",
          department:
            payload.department ?? doctor?.department ?? "General Medicine",
          date: payload.date,
          time: payload.time,
          reason: payload.reason,
          status: payload.status,
          notes: payload.notes,
        };
        set({ appointments: [newAppointment, ...state.appointments] });
        return newAppointment;
      },

      updateAppointment: (id, updates) => {
        set((state) => {
          const appointments = state.appointments.map((a) => {
            if (a.id !== id) return a;
            const nextPatient = updates.patientId
              ? state.patients.find((p) => p.id === updates.patientId)
              : undefined;
            const nextDoctor = updates.doctorId
              ? state.doctors.find((d) => d.id === updates.doctorId)
              : undefined;

            return {
              ...a,
              ...updates,
              patientName: nextPatient?.fullName ?? updates.patientName ?? a.patientName,
              doctorName: nextDoctor?.fullName ?? updates.doctorName ?? a.doctorName,
              department:
                updates.department ?? nextDoctor?.department ?? a.department,
            };
          });
          return { appointments };
        });
      },

      updateAppointmentStatus: (id, status) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status } : a
          ),
        }));
      },

      deleteAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.filter((a) => a.id !== id),
        }));
      },

      addInvoice: (payload) => {
        const state = get();
        const patient = state.patients.find((p) => p.id === payload.patientId);
        const totalAmount = Number((payload.quantity * payload.unitPrice).toFixed(2));
        const newInvoice: Invoice = {
          ...payload,
          id: nextPrefixedId(
            state.invoices.map((i) => i.id),
            "INV",
            4001
          ),
          patientName: patient?.fullName ?? "Unknown Patient",
          totalAmount,
        };
        set({ invoices: [newInvoice, ...state.invoices] });
        return newInvoice;
      },

      updateInvoice: (id, updates) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== id) return inv;
            const patient = updates.patientId
              ? state.patients.find((p) => p.id === updates.patientId)
              : undefined;
            const quantity = updates.quantity ?? inv.quantity;
            const unitPrice = updates.unitPrice ?? inv.unitPrice;
            const totalAmount = Number((quantity * unitPrice).toFixed(2));
            return {
              ...inv,
              ...updates,
              patientName: patient?.fullName ?? updates.patientName ?? inv.patientName,
              quantity,
              unitPrice,
              totalAmount,
            };
          }),
        }));
      },

      toggleInvoiceStatus: (id) => {
        set((state) => ({
          invoices: state.invoices.map((inv) =>
            inv.id === id
              ? {
                  ...inv,
                  status: (inv.status === "Paid" ? "Unpaid" : "Paid") as InvoiceStatus,
                }
              : inv
          ),
        }));
      },

      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        }));
      },

      assignBedToPatient: (wardId, bedId, patientId) => {
        const state = get();
        const patient = state.patients.find((p) => p.id === patientId);
        if (!patient) return;

        set({
          wards: state.wards.map((w) => ({
            ...w,
            beds: w.beds.map((b) => {
              // Ensure patient isn't double-assigned across beds
              if (b.patientId === patientId && b.id !== bedId) {
                return {
                  id: b.id,
                  bedNumber: b.bedNumber,
                  wardId: b.wardId,
                  status: "Available" as const,
                };
              }
              if (w.id === wardId && b.id === bedId) {
                return {
                  ...b,
                  status: "Occupied" as const,
                  patientId: patient.id,
                  patientName: patient.fullName,
                  admittedAt: getTodayIso(),
                };
              }
              return b;
            }),
          })),
          patients: state.patients.map((p) =>
            p.id === patientId ? { ...p, status: "Inpatient" } : p
          ),
        });
      },

      dischargeBed: (wardId, bedId) => {
        set((state) => {
          let dischargedPatientId: string | undefined;
          const wards = state.wards.map((w) => {
            if (w.id !== wardId) return w;
            return {
              ...w,
              beds: w.beds.map((b) => {
                if (b.id !== bedId) return b;
                dischargedPatientId = b.patientId;
                return {
                  id: b.id,
                  bedNumber: b.bedNumber,
                  wardId: b.wardId,
                  status: "Available" as const,
                };
              }),
            };
          });

          return {
            wards,
            patients: dischargedPatientId
              ? state.patients.map((p) =>
                  p.id === dischargedPatientId ? { ...p, status: "Discharged" } : p
                )
              : state.patients,
          };
        });
      },

      setBedMaintenance: (wardId, bedId, status) => {
        set((state) => ({
          wards: state.wards.map((w) =>
            w.id !== wardId
              ? w
              : {
                  ...w,
                  beds: w.beds.map((b) =>
                    b.id !== bedId
                      ? b
                      : {
                          id: b.id,
                          bedNumber: b.bedNumber,
                          wardId: b.wardId,
                          status,
                        }
                  ),
                }
          ),
        }));
      },

      resetDemoData: () => {
        const fresh = buildSeedCollections();
        set({
          patients: fresh.patients,
          doctors: fresh.doctors,
          appointments: fresh.appointments,
          invoices: fresh.invoices,
          wards: fresh.wards,
        });
      },
    }),
    {
      name: "medaxis-hms-storage-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        theme: state.theme,
        patients: state.patients,
        doctors: state.doctors,
        appointments: state.appointments,
        invoices: state.invoices,
        wards: state.wards,
      }),
    }
  )
);
