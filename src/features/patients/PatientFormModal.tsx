"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  SelectInput,
  TextareaInput,
  TextInput,
} from "@/components/ui/FormFields";
import { useHospitalStore } from "@/store/useHospitalStore";
import {
  BLOOD_GROUPS,
  GENDERS,
  PATIENT_STATUSES,
  patientSchema,
  type PatientFormValues,
} from "./patient-schema";
import type { Patient } from "@/lib/types";

interface PatientFormModalProps {
  open: boolean;
  onClose: () => void;
  editingPatient?: Patient | null;
}

export function PatientFormModal({
  open,
  onClose,
  editingPatient,
}: PatientFormModalProps) {
  const addPatient = useHospitalStore((s) => s.addPatient);
  const updatePatient = useHospitalStore((s) => s.updatePatient);
  const pushToast = useHospitalStore((s) => s.pushToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: "",
      age: 30,
      gender: "Female",
      phone: "",
      email: "",
      address: "",
      bloodGroup: "O+",
      status: "Active",
      emergencyContact: "",
      medicalNotes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editingPatient) {
      reset({
        fullName: editingPatient.fullName,
        age: editingPatient.age,
        gender: editingPatient.gender,
        phone: editingPatient.phone,
        email: editingPatient.email,
        address: editingPatient.address,
        bloodGroup: editingPatient.bloodGroup,
        status: editingPatient.status,
        emergencyContact: editingPatient.emergencyContact ?? "",
        medicalNotes: editingPatient.medicalNotes ?? "",
      });
    } else {
      reset({
        fullName: "",
        age: 30,
        gender: "Female",
        phone: "",
        email: "",
        address: "",
        bloodGroup: "O+",
        status: "Active",
        emergencyContact: "",
        medicalNotes: "",
      });
    }
  }, [open, editingPatient, reset]);

  const onSubmit = (values: PatientFormValues) => {
    if (editingPatient) {
      updatePatient(editingPatient.id, values);
      pushToast({
        type: "success",
        title: "Patient updated",
        message: `${values.fullName} (${editingPatient.id}) record saved.`,
      });
    } else {
      const created = addPatient(values);
      pushToast({
        type: "success",
        title: "Patient registered",
        message: `${created.fullName} assigned ID ${created.id}.`,
      });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingPatient ? `Edit Patient · ${editingPatient.id}` : "Register New Patient"}
      description="All records are fictional demo entries persisted locally in your browser."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Full Name"
            required
            placeholder="e.g., Clara Montgomery"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Age"
              type="number"
              required
              min={0}
              max={120}
              error={errors.age?.message}
              {...register("age", { valueAsNumber: true })}
            />
            <SelectInput
              label="Gender"
              required
              options={GENDERS.map((g) => ({ label: g, value: g }))}
              error={errors.gender?.message}
              {...register("gender")}
            />
          </div>
          <TextInput
            label="Phone Number"
            required
            placeholder="+1 (555) 200-4400"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <TextInput
            label="Email Address"
            type="email"
            required
            placeholder="patient@example.org"
            error={errors.email?.message}
            {...register("email")}
          />
          <SelectInput
            label="Blood Group"
            required
            options={BLOOD_GROUPS.map((bg) => ({ label: bg, value: bg }))}
            error={errors.bloodGroup?.message}
            {...register("bloodGroup")}
          />
          <SelectInput
            label="Care Status"
            required
            options={PATIENT_STATUSES.map((st) => ({ label: st, value: st }))}
            error={errors.status?.message}
            {...register("status")}
          />
        </div>

        <TextInput
          label="Residential Address"
          required
          placeholder="120 Commonwealth Ave, Boston, MA"
          error={errors.address?.message}
          {...register("address")}
        />

        <TextInput
          label="Emergency Contact"
          placeholder="Name & phone number (optional)"
          error={errors.emergencyContact?.message}
          {...register("emergencyContact")}
        />

        <TextareaInput
          label="Clinical & Intake Notes"
          placeholder="Allergies, ongoing prescriptions, or admission context..."
          error={errors.medicalNotes?.message}
          {...register("medicalNotes")}
        />

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {editingPatient ? "Save Changes" : "Register Patient"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
