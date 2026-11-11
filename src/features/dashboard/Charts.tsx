"use client";

import React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  AppointmentStatusPoint,
  DepartmentVolumePoint,
  PatientTrendPoint,
  RevenueChartPoint,
} from "@/lib/metrics";
import { formatCurrency } from "@/lib/date";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

export function PatientStatisticsChart({ data }: { data: PatientTrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Patient Statistics</CardTitle>
          <CardDescription>
            Monthly new registrations vs. completed & scheduled visits
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 12, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="visitsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="patientsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.35} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="visits"
                name="Clinical Visits"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#visitsGradient)"
              />
              <Area
                type="monotone"
                dataKey="newPatients"
                name="New Patients"
                stroke="#0d9488"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#patientsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueChart({ data }: { data: RevenueChartPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Revenue Analytics</CardTitle>
          <CardDescription>
            Monthly collected (Paid) vs. outstanding (Unpaid) medical billing
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={data}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.35} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value ?? 0))}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="paid"
                name="Paid Revenue"
                fill="#0284c7"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="unpaid"
                name="Unpaid Invoices"
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function AppointmentStatisticsChart({
  statusData,
  departmentData,
}: {
  statusData: AppointmentStatusPoint[];
  departmentData: DepartmentVolumePoint[];
}) {
  const total = statusData.reduce((acc, s) => acc + s.count, 0);

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Appointment Statistics</CardTitle>
          <CardDescription>
            Status breakdown and top active clinical departments
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
          <div className="h-60 w-full min-w-0 md:col-span-5">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4 md:col-span-7">
            <div className="grid grid-cols-2 gap-2.5">
              {statusData.map((item) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                        aria-hidden="true"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Top Departments by Volume
              </p>
              {departmentData.slice(0, 4).map((dept) => {
                const max = departmentData[0]?.appointments || 1;
                const widthPct = Math.round((dept.appointments / max) * 100);
                return (
                  <div key={dept.department} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {dept.department}
                      </span>
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {dept.appointments} visits
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-sky-600 dark:bg-sky-400"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
