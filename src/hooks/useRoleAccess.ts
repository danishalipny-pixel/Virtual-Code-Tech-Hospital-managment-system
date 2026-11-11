"use client";

import { useHospitalStore } from "@/store/useHospitalStore";
import type { Role } from "@/lib/types";

export interface RolePermissions {
  role: Role | null;
  canAccessBilling: boolean;
  canManageDoctors: boolean;
  canDeletePatients: boolean;
  canDeleteInvoices: boolean;
  canResetSystem: boolean;
  canManageWards: boolean;
  canManageAppointments: boolean;
}

export function getRolePermissions(role: Role | null): RolePermissions {
  return {
    role,
    canAccessBilling: role === "admin" || role === "receptionist",
    canManageDoctors: role === "admin",
    canDeletePatients: role === "admin" || role === "receptionist",
    canDeleteInvoices: role === "admin",
    canResetSystem: role === "admin",
    canManageWards: role === "admin" || role === "doctor" || role === "receptionist",
    canManageAppointments: role === "admin" || role === "doctor" || role === "receptionist",
  };
}

export function useRoleAccess(): RolePermissions {
  const session = useHospitalStore((state) => state.session);
  return getRolePermissions(session?.role ?? null);
}
