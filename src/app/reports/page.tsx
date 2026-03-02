"use client";

import { useEffect, useState } from "react";
import { getAllSensors, generateReport } from "@/lib/api";
import { Sensor, ReportData } from "@/lib/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { subHours } from "date-fns";
import { useTheme } from "@/lib/theme";

const COLORS = [
  "#3b82f6", "#06b6d4", "#10b981", "#f59e0b",
  "#8b5cf6", "#ef4444", "#ec4899", "#6366f1",
];

const presets = [
  { label: "1 час", hours: 1, interval: "minute" as const },
  { label: "6 часов", hours: 6, interval: "minute" as const },
  { label: "24 часа", hours: 24, interval: "hour" as const },
  { label: "7 дней", hours: 168, interval: "hour" as const },
  { label: "30 дней", hours: 720, interval: "day" as const },
];

function StatPill({
  label,
  value,
  unit,
  trend,
}: {
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{label}</p>
      <p className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none">
        {value}
        <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-0.5">{unit}</span>
      </p>
      <div className="flex justify-center mt-1.5">
        {trend === "up" ? (
          <TrendingUp className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
        ) : trend === "down" ? (
          <TrendingDown className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
        ) : (
          <Minus className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        )}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { isDark } = useTheme();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(["s1", "s2"]);
  const [preset, setPreset] = useState(presets[2]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [chartType, setChartType] = useState<"line" | "area">("area");

  useEffect(() => {
    getAllSensors().then((data) => {
      setSensors(data.filter((s) => typeof s.value === "number"));
    });
  }, []);

  const toggleSensor = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return;
    setGenerating(true);
    const now = new Date();
    const from = subHours(now, preset.hours);
    const data = await generateReport({
      sensorIds: selectedIds,
      from: from.toISOString(),
      to: now.toISOString(),
      interval: preset.interval,
    });
    setReports(data);
    setGenerating(false);
    setGenerated(true);
  };

  const mergedChartData = (() => {
    if (reports.length === 0) return [];
    const maxLen = Math.max(...reports.map((r) => r.readings.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number | string> = {
        time: reports[0].readings[i]?.timestamp ?? "",
      };
      reports.forEach((r) => {
        const val = r.readings[i]?.value;
        if (typeof val === "number") point[r.sensorName] = val;
      });
      return point;
    });
  })();

  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const tickColor = isDark ? "#475569" : "#94a3b8";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#1e293b" : "#e2e8f0";
  const tooltipText = isDark ? "#e2e8f0" : "#1e293b";

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Настройка отчёта</h2>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
              Временной диапазон
            </label>
            <div className="flex gap-2 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPreset(p)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                    preset.label === p.label
                      ? "bg-blue-500 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
              Датчики ({selectedIds.length} выбрано)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {sensors.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all",
                    selectedIds.includes(s.id)
                      ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/40"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggleSensor(s.id)}
                    className="accent-blue-500 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                      {s.room} · {s.unit}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || selectedIds.length === 0}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
              selectedIds.length === 0
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
            )}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Формирование...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4" />
                Сформировать отчёт
              </>
            )}
          </button>
        </div>
      </div>

      {generated && reports.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((r) => {
              const trend =
                r.readings.length > 1
                  ? r.readings[r.readings.length - 1].value > r.readings[0].value
                    ? "up"
                    : r.readings[r.readings.length - 1].value < r.readings[0].value
                    ? "down"
                    : "stable"
                  : "stable";

              return (
                <div
                  key={r.sensorId}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3 truncate">
                    {r.sensorName}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <StatPill label="Среднее" value={r.avg} unit={r.unit} trend="stable" />
                    <StatPill label="Мин." value={r.min} unit={r.unit} trend="down" />
                    <StatPill label="Макс." value={r.max} unit={r.unit} trend="up" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                График за {preset.label}
              </h2>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setChartType("area")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    chartType === "area"
                      ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  Область
                </button>
                <button
                  onClick={() => setChartType("line")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    chartType === "line"
                      ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  Линия
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              {chartType === "area" ? (
                <AreaChart data={mergedChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    {reports.map((r, i) => (
                      <linearGradient key={r.sensorId} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={isDark ? 0.25 : 0.15} />
                        <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: `1px solid ${tooltipBorder}`, background: tooltipBg, color: tooltipText, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
                  {reports.map((r, i) => (
                    <Area
                      key={r.sensorId}
                      type="monotone"
                      dataKey={r.sensorName}
                      stroke={COLORS[i % COLORS.length]}
                      fill={`url(#grad-${i})`}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </AreaChart>
              ) : (
                <LineChart data={mergedChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: `1px solid ${tooltipBorder}`, background: tooltipBg, color: tooltipText, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
                  {reports.map((r, i) => (
                    <Line
                      key={r.sensorId}
                      type="monotone"
                      dataKey={r.sensorName}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      )}

      {generated && reports.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
          <BarChart3 className="w-8 h-8 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400">Нет данных для отображения</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Выберите числовые датчики (температура, влажность и др.)
          </p>
        </div>
      )}
    </div>
  );
}
