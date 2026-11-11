"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SelectInput, TextInput } from "@/components/ui/FormFields";
import { useHospitalStore } from "@/store/useHospitalStore";
import {
  AVATAR_PRESETS,
  DOCTOR_AVAILABILITY_OPTIONS,
  SPECIALIZATIONS,
  doctorSchema,
  type DoctorFormValues,
} from "./doctor-schema";
import type { Doctor } from "@/lib/types";
import { cn } from "@/lib/cn";

interface DoctorFormModalProps {
  open: boolean;
  onClose: () => void;
  editingDoctor?: Doctor | null;
}

export function DoctorFormModal({
  open,
  onClose,
  editingDoctor,
}: DoctorFormModalProps) {
  const addDoctor = useHospitalStore((s) => s.addDoctor);
  const updateDoctor = useHospitalStore((s) => s.updateDoctor);
  const pushToast = useHospitalStore((s) => s.pushToast);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      fullName: "",
      profileImage: AVATAR_PRESETS[0],
      specialization: "Cardiology",
      department: "Cardiology",
      phone: "",
      email: "",
      experience: 5,
      availability: "Available",
      consultationFee: 180,
      qualifications: "",
    },
  });

  const selectedAvatar = useWatch({ control, name: "profileImage" });

  useEffect(() => {
    if (!open) return;
    if (editingDoctor) {
      reset({
        fullName: editingDoctor.fullName,
        profileImage: editingDoctor.profileImage,
        specialization: editingDoctor.specialization,
        department: editingDoctor.department,
        phone: editingDoctor.phone,
        email: editingDoctor.email,
        experience: editingDoctor.experience,
        availability: editingDoctor.availability,
        consultationFee: editingDoctor.consultationFee,
        qualifications: editingDoctor.qualifications ?? "",
      });
    } else {
      reset({
        fullName: "",
        profileImage: AVATAR_PRESETS[0],
        specialization: "Cardiology",
        department: "Cardiology",
        phone: "",
        email: "",
        experience: 5,
        availability: "Available",
        consultationFee: 180,
        qualifications: "",
      });
    }
  }, [open, editingDoctor, reset]);

  const onSubmit = (values: DoctorFormValues) => {
    if (editingDoctor) {
      updateDoctor(editingDoctor.id, values);
      pushToast({
        type: "success",
        title: "Doctor profile updated",
        message: `${values.fullName} (${editingDoctor.id}) saved.`,
      });
    } else {
      const created = addDoctor({
        ...values,
        scheduleDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      });
      pushToast({
        type: "success",
        title: "Physician added",
        message: `${created.fullName} added under ${created.specialization}.`,
      });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingDoctor ? `Edit Doctor · ${editingDoctor.id}` : "Add New Physician"}
      description="Configure physician profile, specialization, and availability status."
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Avatar Preset Selector */}
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Profile Avatar Preset
          </span>
          <div className="mt-2 flex flex-wrap gap-2.5">
            {AVATAR_PRESETS.map((preset, idx) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue("profileImage", preset, { shouldValidate: true })}
                aria-label={`Select doctor avatar preset ${idx + 1}`}
                className={cn(
                  "relative h-11 w-11 overflow-hidden rounded-full border-2 transition-all cursor-pointer",
                  selectedAvatar === preset
                    ? "border-sky-600 ring-2 ring-sky-500/30 scale-105"
                    : "border-slate-200 hover:border-sky-300 dark:border-slate-700"
                )}
              >
                <Image
                  src={preset}
                  alt={`Avatar preset ${idx + 1}`}
                  width={44}
                  height={44}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextInput
            label="Full Name"
            required
            placeholder="Dr. Lucas Bennett"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <TextInput
            label="Profile Image Path / URL"
            required
            placeholder="/avatars/doctor-1.svg"
            error={errors.profileImage?.message}
            {...register("profileImage")}
          />
          <SelectInput
            label="Specialization"
            required
            options={SPECIALIZATIONS.map((s) => ({ label: s, value: s }))}
            error={errors.specialization?.message}
            {...register("specialization")}
          />
          <TextInput
            label="Department"
            required
            placeholder="Cardiology"
            error={errors.department?.message}
            {...register("department")}
          />
          <TextInput
            label="Phone Number"
            required
            placeholder="+1 (555) 901-1199"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <TextInput
            label="Email Address"
            type="email"
            required
            placeholder="doctor@medaxis.org"
            error={errors.email?.message}
            {...register("email")}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              label="Experience (Yrs)"
              type="number"
              required
              min={0}
              max={60}
              error={errors.experience?.message}
              {...register("experience", { valueAsNumber: true })}
            />
            <TextInput
              label="Consult Fee (\$)"
              type="number"
              required
              min={20}
              max={5000}
              error={errors.consultationFee?.message}
              {...register("consultationFee", { valueAsNumber: true })}
            />
          </div>
          <SelectInput
            label="Availability Status"
            required
            options={DOCTOR_AVAILABILITY_OPTIONS.map((a) => ({
              label: a,
              value: a,
            }))}
            error={errors.availability?.message}
            {...register("availability")}
          />
        </div>

        <TextInput
          label="Qualifications & Credentials"
          placeholder="MD, FACC — Interventional Cardiology"
          error={errors.qualifications?.message}
          {...register("qualifications")}
        />

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {editingDoctor ? "Save Physician" : "Add Physician"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
