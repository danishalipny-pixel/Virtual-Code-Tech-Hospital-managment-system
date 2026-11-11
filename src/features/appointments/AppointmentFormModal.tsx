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
import { getTodayIso } from "@/lib/date";
import {
  APPOINTMENT_STATUSES,
  appointmentSchema,
  rescheduleSchema,
  type AppointmentFormValues,
  type RescheduleFormValues,
} from "./appointment-schema";
import type { Appointment } from "@/lib/types";

interface AppointmentFormModalProps {
  open: boolean;
  onClose: () => void;
  editingAppointment?: Appointment | null;
  defaultDate?: string;
}

export function AppointmentFormModal({
  open,
  onClose,
  editingAppointment,
  defaultDate,
}: AppointmentFormModalProps) {
  const patients = useHospitalStore((s) => s.patients);
  const doctors = useHospitalStore((s) => s.doctors);
  const addAppointment = useHospitalStore((s) => s.addAppointment);
  const updateAppointment = useHospitalStore((s) => s.updateAppointment);
  const pushToast = useHospitalStore((s) => s.pushToast);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: patients[0]?.id ?? "",
      doctorId: doctors[0]?.id ?? "",
      department: doctors[0]?.department ?? "Cardiology",
      date: defaultDate ?? getTodayIso(),
      time: "09:30",
      reason: "",
      status: "Pending",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editingAppointment) {
      reset({
        patientId: editingAppointment.patientId,
        doctorId: editingAppointment.doctorId,
        department: editingAppointment.department,
        date: editingAppointment.date,
        time: editingAppointment.time,
        reason: editingAppointment.reason,
        status: editingAppointment.status,
        notes: editingAppointment.notes ?? "",
      });
    } else {
      const firstDoctor = doctors[0];
      reset({
        patientId: patients[0]?.id ?? "",
        doctorId: firstDoctor?.id ?? "",
        department: firstDoctor?.department ?? "General Medicine",
        date: defaultDate ?? getTodayIso(),
        time: "10:00",
        reason: "",
        status: "Pending",
        notes: "",
      });
    }
  }, [open, editingAppointment, defaultDate, patients, doctors, reset]);

  const doctorRegister = register("doctorId", {
    onChange: (e) => {
      const chosen = doctors.find((d) => d.id === e.target.value);
      if (chosen) {
        setValue("department", chosen.department, { shouldValidate: true });
      }
    },
  });

  const onSubmit = (values: AppointmentFormValues) => {
    if (editingAppointment) {
      updateAppointment(editingAppointment.id, values);
      pushToast({
        type: "success",
        title: "Appointment updated",
        message: `Updated ${editingAppointment.id} for ${values.date} at ${values.time}.`,
      });
    } else {
      const created = addAppointment(values);
      pushToast({
        type: "success",
        title: "Appointment booked",
        message: `${created.id} scheduled for ${created.patientName} with ${created.doctorName}.`,
      });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        editingAppointment
          ? `Edit Appointment · ${editingAppointment.id}`
          : "Book New Appointment"
      }
      description="Assign patient, attending specialist, clinical slot, and status."
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

          <SelectInput
            label="Attending Physician"
            required
            placeholder="Select a doctor"
            options={doctors.map((d) => ({
              label: `${d.fullName} · ${d.specialization}`,
              value: d.id,
            }))}
            error={errors.doctorId?.message}
            {...doctorRegister}
          />

          <TextInput
            label="Department"
            required
            placeholder="Cardiology"
            error={errors.department?.message}
            {...register("department")}
          />

          <SelectInput
            label="Status"
            required
            options={APPOINTMENT_STATUSES.map((st) => ({
              label: st,
              value: st,
            }))}
            error={errors.status?.message}
            {...register("status")}
          />

          <TextInput
            label="Appointment Date"
            type="date"
            required
            error={errors.date?.message}
            {...register("date")}
          />

          <TextInput
            label="Appointment Time"
            type="time"
            required
            error={errors.time?.message}
            {...register("time")}
          />
        </div>

        <TextInput
          label="Reason for Visit"
          required
          placeholder="e.g., Post-operative follow-up & cardiac review"
          error={errors.reason?.message}
          {...register("reason")}
        />

        <TextareaInput
          label="Clinical Instructions / Notes"
          placeholder="Pre-visit fasting or imaging notes (optional)"
          error={errors.notes?.message}
          {...register("notes")}
        />

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {editingAppointment ? "Save Appointment" : "Book Appointment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface RescheduleModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export function RescheduleModal({
  appointment,
  onClose,
}: RescheduleModalProps) {
  const updateAppointment = useHospitalStore((s) => s.updateAppointment);
  const pushToast = useHospitalStore((s) => s.pushToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: {
      date: appointment?.date ?? getTodayIso(),
      time: appointment?.time ?? "10:00",
      notes: appointment?.notes ?? "",
    },
  });

  useEffect(() => {
    if (!appointment) return;
    reset({
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes ?? "",
    });
  }, [appointment, reset]);

  const onSubmit = (values: RescheduleFormValues) => {
    if (!appointment) return;
    updateAppointment(appointment.id, {
      date: values.date,
      time: values.time,
      notes: values.notes,
      status: appointment.status === "Cancelled" ? "Pending" : appointment.status,
    });
    pushToast({
      type: "success",
      title: "Appointment rescheduled",
      message: `${appointment.patientName} moved to ${values.date} at ${values.time}.`,
    });
    onClose();
  };

  return (
    <Modal
      open={Boolean(appointment)}
      onClose={onClose}
      title={appointment ? `Reschedule · ${appointment.id}` : "Reschedule"}
      description={
        appointment
          ? `${appointment.patientName} with ${appointment.doctorName}`
          : undefined
      }
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <TextInput
          label="New Date"
          type="date"
          required
          error={errors.date?.message}
          {...register("date")}
        />
        <TextInput
          label="New Time"
          type="time"
          required
          error={errors.time?.message}
          {...register("time")}
        />
        <TextareaInput
          label="Reschedule Reason"
          placeholder="Optional note..."
          error={errors.notes?.message}
          {...register("notes")}
        />
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Confirm New Slot
          </Button>
        </div>
      </form>
    </Modal>
  );
}
