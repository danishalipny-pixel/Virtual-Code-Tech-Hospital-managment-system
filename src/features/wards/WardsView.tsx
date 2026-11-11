"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  CheckCircle2,
  Download,
  UserCheck,
  UserMinus,
  Wrench,
} from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import { downloadCsv } from "@/lib/csv";
import { formatDisplayDate } from "@/lib/date";
import type { Bed, BedStatus } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function WardsView() {
  const wards = useHospitalStore((s) => s.wards);
  const patients = useHospitalStore((s) => s.patients);
  const assignBedToPatient = useHospitalStore((s) => s.assignBedToPatient);
  const dischargeBed = useHospitalStore((s) => s.dischargeBed);
  const setBedMaintenance = useHospitalStore((s) => s.setBedMaintenance);
  const pushToast = useHospitalStore((s) => s.pushToast);

  const [statusFilter, setStatusFilter] = useState<"ALL" | BedStatus>("ALL");
  const [admitTarget, setAdmitTarget] = useState<{
    wardId: string;
    wardName: string;
    bed: Bed;
  } | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [dischargeTarget, setDischargeTarget] = useState<{
    wardId: string;
    bed: Bed;
  } | null>(null);

  const stats = useMemo(() => {
    const allBeds = wards.flatMap((w) => w.beds);
    const total = allBeds.length;
    const occupied = allBeds.filter((b) => b.status === "Occupied").length;
    const available = allBeds.filter((b) => b.status === "Available").length;
    const maintenance = allBeds.filter((b) => b.status === "Maintenance").length;
    return {
      total,
      occupied,
      available,
      maintenance,
      occupancyPct: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  }, [wards]);

  const occupiedPatientIds = useMemo(() => {
    const set = new Set<string>();
    for (const w of wards) {
      for (const b of w.beds) {
        if (b.patientId) set.add(b.patientId);
      }
    }
    return set;
  }, [wards]);

  const eligiblePatients = useMemo(
    () => patients.filter((p) => !occupiedPatientIds.has(p.id)),
    [patients, occupiedPatientIds]
  );

  const handleOpenAdmit = (wardId: string, wardName: string, bed: Bed) => {
    setAdmitTarget({ wardId, wardName, bed });
    setSelectedPatientId(eligiblePatients[0]?.id ?? "");
  };

  const handleConfirmAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitTarget || !selectedPatientId) return;
    assignBedToPatient(admitTarget.wardId, admitTarget.bed.id, selectedPatientId);
    const patient = patients.find((p) => p.id === selectedPatientId);
    pushToast({
      type: "success",
      title: "Patient admitted",
      message: `${patient?.fullName ?? "Patient"} assigned to bed ${admitTarget.bed.bedNumber}.`,
    });
    setAdmitTarget(null);
  };

  const handleExportCsv = () => {
    const flatRows = wards.flatMap((w) =>
      w.beds.map((b) => ({
        ward: w.name,
        floor: w.floor,
        bedNumber: b.bedNumber,
        status: b.status,
        patientName: b.patientName ?? "",
        admittedAt: b.admittedAt ?? "",
      }))
    );
    downloadCsv("medaxis-wards-beds.csv", flatRows, [
      { header: "Ward", accessor: (r) => r.ward },
      { header: "Floor", accessor: (r) => r.floor },
      { header: "Bed Number", accessor: (r) => r.bedNumber },
      { header: "Status", accessor: (r) => r.status },
      { header: "Assigned Patient", accessor: (r) => r.patientName },
      { header: "Admitted Date", accessor: (r) => r.admittedAt },
    ]);
    pushToast({
      type: "info",
      title: "Ward report exported",
      message: `Exported ${flatRows.length} beds across ${wards.length} wards.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Ward & Bed Availability Tracker
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time inpatient capacity across ICU, Cardiology, General Medicine, Orthopedics, Pediatrics & Maternity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter beds by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | BedStatus)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="ALL">All Bed Statuses</option>
            <option value="Available">Available Only</option>
            <option value="Occupied">Occupied Only</option>
            <option value="Maintenance">Maintenance Only</option>
          </select>
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Ward Summary Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Total Beds
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {stats.total}
            </p>
            <span className="text-xs text-slate-400">
              {stats.occupancyPct}% occupancy rate
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-400">
              Available Now
            </span>
            <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {stats.available}
            </p>
            <span className="text-xs text-slate-400">Ready for admission</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase text-sky-700 dark:text-sky-400">
              Occupied
            </span>
            <p className="mt-1 text-2xl font-bold text-sky-700 dark:text-sky-400">
              {stats.occupied}
            </p>
            <span className="text-xs text-slate-400">Active inpatient care</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">
              Maintenance
            </span>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.maintenance}
            </p>
            <span className="text-xs text-slate-400">Sanitization / service</span>
          </CardContent>
        </Card>
      </div>

      {/* Wards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {wards.map((ward) => {
          const visibleBeds = ward.beds.filter(
            (b) => statusFilter === "ALL" || b.status === statusFilter
          );

          return (
            <Card key={ward.id}>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BedDouble className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
                    <span>{ward.name}</span>
                  </CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {ward.floor} · {ward.department}
                  </p>
                </div>
                <Badge tone="info">
                  {ward.beds.filter((b) => b.status === "Available").length} /{" "}
                  {ward.beds.length} free
                </Badge>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {visibleBeds.length === 0 ? (
                  <p className="col-span-full py-6 text-center text-xs text-slate-400">
                    No beds in this ward match the selected filter.
                  </p>
                ) : (
                  visibleBeds.map((bed) => (
                    <div
                      key={bed.id}
                      className={cn(
                        "flex flex-col justify-between rounded-xl border p-3.5 transition-colors",
                        bed.status === "Available" &&
                          "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20",
                        bed.status === "Occupied" &&
                          "border-sky-200 bg-sky-50/40 dark:border-sky-900/60 dark:bg-sky-950/20",
                        bed.status === "Maintenance" &&
                          "border-amber-200 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                            {bed.bedNumber}
                          </span>
                          <Badge status={bed.status}>{bed.status}</Badge>
                        </div>

                        {bed.status === "Occupied" && bed.patientName ? (
                          <div className="mt-2">
                            <Link
                              href={`/patients/${bed.patientId}`}
                              className="text-sm font-semibold text-sky-800 hover:underline dark:text-sky-300"
                            >
                              {bed.patientName}
                            </Link>
                            {bed.admittedAt && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Admitted {formatDisplayDate(bed.admittedAt)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            {bed.status === "Available"
                              ? "Sanitized & ready for patient admission"
                              : "Temporarily offline for maintenance"}
                          </p>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        {bed.status === "Available" && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              icon={<UserCheck className="h-3.5 w-3.5" />}
                              onClick={() =>
                                handleOpenAdmit(ward.id, ward.name, bed)
                              }
                            >
                              Admit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={<Wrench className="h-3.5 w-3.5" />}
                              onClick={() => {
                                setBedMaintenance(ward.id, bed.id, "Maintenance");
                                pushToast({
                                  type: "warning",
                                  title: "Bed set to maintenance",
                                  message: `${bed.bedNumber} marked under maintenance.`,
                                });
                              }}
                            >
                              Service
                            </Button>
                          </>
                        )}

                        {bed.status === "Occupied" && (
                          <Button
                            size="sm"
                            variant="outline"
                            icon={<UserMinus className="h-3.5 w-3.5" />}
                            onClick={() =>
                              setDischargeTarget({ wardId: ward.id, bed })
                            }
                          >
                            Discharge
                          </Button>
                        )}

                        {bed.status === "Maintenance" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            onClick={() => {
                              setBedMaintenance(ward.id, bed.id, "Available");
                              pushToast({
                                type: "success",
                                title: "Bed back in service",
                                message: `${bed.bedNumber} is now Available.`,
                              });
                            }}
                          >
                            Mark Ready
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admit Patient Modal */}
      <Modal
        open={Boolean(admitTarget)}
        onClose={() => setAdmitTarget(null)}
        title={
          admitTarget
            ? `Admit Patient to ${admitTarget.bed.bedNumber}`
            : "Admit Patient"
        }
        description={admitTarget?.wardName}
        size="sm"
      >
        <form onSubmit={handleConfirmAdmit} className="space-y-4">
          {eligiblePatients.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              All registered patients are already assigned to hospital beds.
              Register a new patient first to admit them.
            </p>
          ) : (
            <div className="space-y-1.5">
              <label
                htmlFor="admit-patient-select"
                className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                Select Patient
              </label>
              <select
                id="admit-patient-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {eligiblePatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.id}) · {p.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setAdmitTarget(null)}>
              Cancel
            </Button>
            {eligiblePatients.length > 0 && (
              <Button type="submit" variant="primary">
                Confirm Admission
              </Button>
            )}
          </div>
        </form>
      </Modal>

      {/* Discharge Confirm */}
      <ConfirmDialog
        open={Boolean(dischargeTarget)}
        onClose={() => setDischargeTarget(null)}
        onConfirm={() => {
          if (!dischargeTarget) return;
          dischargeBed(dischargeTarget.wardId, dischargeTarget.bed.id);
          pushToast({
            type: "info",
            title: "Patient discharged",
            message: `${dischargeTarget.bed.patientName ?? "Patient"} discharged from bed ${dischargeTarget.bed.bedNumber}.`,
          });
        }}
        title="Discharge Patient from Bed?"
        message={
          dischargeTarget
            ? `Release bed ${dischargeTarget.bed.bedNumber} currently assigned to ${dischargeTarget.bed.patientName}? The patient's care status will update to Discharged.`
            : ""
        }
        confirmLabel="Confirm Discharge"
        variant="primary"
      />
    </div>
  );
}
