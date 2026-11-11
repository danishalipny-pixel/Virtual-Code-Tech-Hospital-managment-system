"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Appointment } from "@/lib/types";
import { formatDisplayDate, getTodayIso } from "@/lib/date";
import { cn } from "@/lib/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface AppointmentCalendarProps {
  appointments: Appointment[];
  selectedDate: string;
  onSelectDate: (isoDate: string) => void;
  onBookOnDate: (isoDate: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AppointmentCalendar({
  appointments,
  selectedDate,
  onSelectDate,
  onBookOnDate,
}: AppointmentCalendarProps) {
  const todayIso = getTodayIso();
  const initialDate = selectedDate || todayIso;
  const [cursorYear, setCursorYear] = useState(() =>
    Number(initialDate.slice(0, 4))
  );
  const [cursorMonth, setCursorMonth] = useState(
    () => Number(initialDate.slice(5, 7)) - 1
  );

  const monthTitle = useMemo(() => {
    const d = new Date(Date.UTC(cursorYear, cursorMonth, 1));
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  }, [cursorYear, cursorMonth]);

  const calendarCells = useMemo(() => {
    const firstDayWeekday = new Date(Date.UTC(cursorYear, cursorMonth, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(cursorYear, cursorMonth + 1, 0)).getUTCDate();
    const cells: Array<{ iso: string; day: number } | null> = [];

    for (let i = 0; i < firstDayWeekday; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(cursorMonth + 1).padStart(2, "0");
      const dd = String(d).padStart(2, "0");
      cells.push({ iso: `${cursorYear}-${mm}-${dd}`, day: d });
    }
    return cells;
  }, [cursorYear, cursorMonth]);

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const apt of appointments) {
      const list = map.get(apt.date) ?? [];
      list.push(apt);
      map.set(apt.date, list);
    }
    return map;
  }, [appointments]);

  const activeDay = selectedDate || todayIso;
  const dayAgenda = useMemo(
    () =>
      (appointmentsByDay.get(activeDay) ?? [])
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointmentsByDay, activeDay]
  );

  const goPrevMonth = () => {
    if (cursorMonth === 0) {
      setCursorMonth(11);
      setCursorYear((y) => y - 1);
    } else {
      setCursorMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (cursorMonth === 11) {
      setCursorMonth(0);
      setCursorYear((y) => y + 1);
    } else {
      setCursorMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    setCursorYear(Number(todayIso.slice(0, 4)));
    setCursorMonth(Number(todayIso.slice(5, 7)) - 1);
    onSelectDate(todayIso);
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      {/* Monthly Grid */}
      <Card className="xl:col-span-8">
        <CardHeader>
          <CardTitle>{monthTitle}</CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={jumpToToday}>
              Today
            </Button>
            <Button
              size="sm"
              variant="outline"
              aria-label="Previous month"
              onClick={goPrevMonth}
              icon={<ChevronLeft className="h-4 w-4" />}
            />
            <Button
              size="sm"
              variant="outline"
              aria-label="Next month"
              onClick={goNextMonth}
              icon={<ChevronRight className="h-4 w-4" />}
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1.5">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-20 rounded-xl bg-slate-50/40 dark:bg-slate-900/20" />;
              }
              const list = appointmentsByDay.get(cell.iso) ?? [];
              const isToday = cell.iso === todayIso;
              const isSelected = cell.iso === activeDay;

              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => onSelectDate(cell.iso)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex h-20 flex-col items-start justify-between rounded-xl border p-2 text-left transition-all cursor-pointer",
                    isSelected
                      ? "border-sky-500 bg-sky-50/90 ring-2 ring-sky-500/25 dark:border-sky-400 dark:bg-sky-950/60"
                      : "border-slate-100 bg-white hover:border-sky-200 hover:bg-sky-50/30 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                      isToday
                        ? "bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950"
                        : "text-slate-700 dark:text-slate-200"
                    )}
                  >
                    {cell.day}
                  </span>

                  {list.length > 0 && (
                    <div className="w-full space-y-0.5">
                      <span className="block truncate rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-900/70 dark:text-sky-200">
                        {list.length} {list.length === 1 ? "visit" : "visits"}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Agenda */}
      <Card className="xl:col-span-4">
        <CardHeader>
          <div>
            <CardTitle>Day Agenda</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatDisplayDate(activeDay)}
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={() => onBookOnDate(activeDay)}
          >
            Book Slot
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {dayAgenda.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                No appointments scheduled
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Click &ldquo;Book Slot&rdquo; to schedule a visit on {formatDisplayDate(activeDay)}.
              </p>
            </div>
          ) : (
            dayAgenda.map((apt) => (
              <div
                key={apt.id}
                className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                    {apt.time} · {apt.id}
                  </span>
                  <Badge status={apt.status}>{apt.status}</Badge>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-white">
                  {apt.patientName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {apt.doctorName} ({apt.department})
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {apt.reason}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
