"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  CalendarClock,
  Check,
  CheckCheck,
  Download,
  List,
  Pencil,
  Plus,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { useHospitalStore } from "@/store/useHospitalStore";
import { downloadCsv } from "@/lib/csv";
import { formatDisplayDate, getTodayIso } from "@/lib/date";
import type { Appointment } from "@/lib/types";
import { APPOINTMENT_STATUSES } from "./appointment-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, Pagination, type TableColumn } from "@/components/ui/Table";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  AppointmentFormModal,
  RescheduleModal,
} from "./AppointmentFormModal";
import { AppointmentCalendar } from "./AppointmentCalendar";

const PAGE_SIZE = 7;

export function AppointmentsView() {
  const appointments = useHospitalStore((s) => s.appointments);
  const updateAppointmentStatus = useHospitalStore(
    (s) => s.updateAppointmentStatus
  );
  const pushToast = useHospitalStore((s) => s.pushToast);

  const todayIso = getTodayIso();

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [calendarDate, setCalendarDate] = useState(todayIso);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [defaultBookDate, setDefaultBookDate] = useState<string | undefined>(
    undefined
  );
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(
    null
  );
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  const departments = useMemo(
    () => Array.from(new Set(appointments.map((a) => a.department))).sort(),
    [appointments]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments
      .filter((a) => {
        const matchesSearch =
          !q ||
          a.patientName.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "ALL" || a.status === statusFilter;
        const matchesDept =
          departmentFilter === "ALL" || a.department === departmentFilter;
        const matchesDate = !dateFilter || a.date === dateFilter;
        return matchesSearch && matchesStatus && matchesDept && matchesDate;
      })
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  }, [appointments, search, statusFilter, departmentFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const hasFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    departmentFilter !== "ALL" ||
    dateFilter !== "";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDepartmentFilter("ALL");
    setDateFilter("");
    setPage(1);
  };

  const handleExportCsv = () => {
    downloadCsv("medaxis-appointments.csv", filtered, [
      { header: "Appointment ID", accessor: (a) => a.id },
      { header: "Patient Name", accessor: (a) => a.patientName },
      { header: "Doctor Name", accessor: (a) => a.doctorName },
      { header: "Department", accessor: (a) => a.department },
      { header: "Date", accessor: (a) => a.date },
      { header: "Time", accessor: (a) => a.time },
      { header: "Status", accessor: (a) => a.status },
      { header: "Reason", accessor: (a) => a.reason },
    ]);
    pushToast({
      type: "info",
      title: "Appointments exported",
      message: `Downloaded ${filtered.length} appointments as CSV.`,
    });
  };

  const columns: TableColumn<Appointment>[] = [
    {
      key: "id",
      header: "ID & Slot",
      render: (a) => (
        <div>
          <span className="font-mono text-xs font-semibold text-sky-700 dark:text-sky-400">
            {a.id}
          </span>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
            {formatDisplayDate(a.date)} · {a.time}
          </p>
        </div>
      ),
    },
    {
      key: "patient",
      header: "Patient",
      render: (a) => (
        <Link
          href={`/patients/${a.patientId}`}
          className="font-semibold text-slate-900 hover:text-sky-700 hover:underline dark:text-slate-100 dark:hover:text-sky-400"
        >
          {a.patientName}
        </Link>
      ),
    },
    {
      key: "doctor",
      header: "Doctor",
      render: (a) => (
        <div>
          <Link
            href={`/doctors/${a.doctorId}`}
            className="font-medium text-slate-800 hover:text-sky-700 hover:underline dark:text-slate-200 dark:hover:text-sky-400"
          >
            {a.doctorName}
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {a.department}
          </p>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (a) => (
        <span className="line-clamp-2 max-w-xs text-xs text-slate-600 dark:text-slate-300">
          {a.reason}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a) => <Badge status={a.status}>{a.status}</Badge>,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      render: (a) => (
        <div className="inline-flex items-center justify-end gap-1">
          {a.status === "Pending" && (
            <button
              type="button"
              title="Confirm Appointment"
              aria-label={`Confirm ${a.id}`}
              onClick={() => {
                updateAppointmentStatus(a.id, "Confirmed");
                pushToast({
                  type: "success",
                  title: "Appointment confirmed",
                  message: `${a.patientName} (${a.id}) confirmed.`,
                });
              }}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 cursor-pointer"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {a.status === "Confirmed" && (
            <button
              type="button"
              title="Mark Completed"
              aria-label={`Complete ${a.id}`}
              onClick={() => {
                updateAppointmentStatus(a.id, "Completed");
                pushToast({
                  type: "success",
                  title: "Visit completed",
                  message: `${a.patientName} (${a.id}) marked Completed.`,
                });
              }}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            title="Reschedule"
            aria-label={`Reschedule ${a.id}`}
            onClick={() => setRescheduleTarget(a)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            title="Edit Appointment"
            aria-label={`Edit ${a.id}`}
            onClick={() => {
              setEditingAppointment(a);
              setDefaultBookDate(undefined);
              setModalOpen(true);
            }}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          {a.status !== "Cancelled" && a.status !== "Completed" && (
            <button
              type="button"
              title="Cancel Appointment"
              aria-label={`Cancel ${a.id}`}
              onClick={() => setCancelTarget(a)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/60 cursor-pointer"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Appointments & Clinical Schedule
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {appointments.filter((a) => a.date === todayIso && a.status !== "Cancelled").length} visits today ·{" "}
            {appointments.filter((a) => a.status === "Pending").length} pending confirmation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                viewMode === "list"
                  ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <List className="h-3.5 w-3.5" aria-hidden="true" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              aria-pressed={viewMode === "calendar"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-300"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              Calendar
            </button>
          </div>

          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditingAppointment(null);
              setDefaultBookDate(undefined);
              setModalOpen(true);
            }}
          >
            Book Appointment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="relative md:col-span-4">
              <label htmlFor="appointment-search" className="sr-only">
                Search appointments
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="appointment-search"
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search patient, doctor, or ID..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="appointment-status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="appointment-status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Statuses</option>
                {APPOINTMENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="appointment-dept-filter" className="sr-only">
                Filter by department
              </label>
              <select
                id="appointment-dept-filter"
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex items-center gap-2">
              <label htmlFor="appointment-date-filter" className="sr-only">
                Filter by date
              </label>
              <input
                id="appointment-date-filter"
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-sky-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDateFilter(dateFilter === todayIso ? "" : todayIso);
                  setPage(1);
                }}
              >
                {dateFilter === todayIso ? "All" : "Today"}
              </Button>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  aria-label="Clear appointment filters"
                  icon={<X className="h-4 w-4" />}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === "calendar" ? (
        <AppointmentCalendar
          appointments={filtered}
          selectedDate={calendarDate}
          onSelectDate={setCalendarDate}
          onBookOnDate={(date) => {
            setEditingAppointment(null);
            setDefaultBookDate(date);
            setModalOpen(true);
          }}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Appointments Queue ({filtered.length})</CardTitle>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Confirm, complete, reschedule, or cancel appointments inline
            </span>
          </CardHeader>
          <DataTable
            caption="Hospital appointments list"
            columns={columns}
            data={paginated}
            rowKey={(a) => a.id}
            emptyTitle="No appointments found"
            emptyDescription="No bookings match your current date or status filters."
            emptyAction={
              hasFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Reset Filters
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setModalOpen(true)}
                >
                  Book Appointment
                </Button>
              )
            }
          />
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </Card>
      )}

      <AppointmentFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAppointment(null);
          setDefaultBookDate(undefined);
        }}
        editingAppointment={editingAppointment}
        defaultDate={defaultBookDate}
      />

      <RescheduleModal
        appointment={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => {
          if (!cancelTarget) return;
          updateAppointmentStatus(cancelTarget.id, "Cancelled");
          pushToast({
            type: "warning",
            title: "Appointment cancelled",
            message: `${cancelTarget.id} for ${cancelTarget.patientName} was marked Cancelled.`,
          });
        }}
        title="Cancel Appointment?"
        message={
          cancelTarget
            ? `Are you sure you want to cancel ${cancelTarget.patientName}'s appointment (${cancelTarget.id}) with ${cancelTarget.doctorName} on ${formatDisplayDate(cancelTarget.date)}?`
            : ""
        }
        confirmLabel="Cancel Appointment"
      />
    </div>
  );
}
