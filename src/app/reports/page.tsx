"use client";

import { useEffect, useState } from "react";
import { generateReport } from "@/lib/api";
import { ReportData } from "@/lib/types";
import { useSensors } from "@/lib/hooks";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { subHours } from "date-fns";
import { useTheme } from "@/lib/theme";

const COLORS = [
  "#4f6ef7", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#6366f1",
];

const presets = [
  { label: "1 час", hours: 1, interval: "minute" as const },
  { label: "6 часов", hours: 6, interval: "minute" as const },
  { label: "24 часа", hours: 24, interval: "hour" as const },
  { label: "7 дней", hours: 168, interval: "hour" as const },
  { label: "30 дней", hours: 720, interval: "day" as const },
];

function StatPill({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl p-3 text-center">
      <p className="text-[11px] text-[var(--text-faint)] uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className="text-base font-bold text-[var(--text-primary)] tabular-nums leading-none">
        {value}
        <span className="text-xs font-normal text-[var(--text-faint)] ml-0.5">{unit}</span>
      </p>
    </div>
  );
}

export default function ReportsPage() {
  const { isDark } = useTheme();
  const allSensors = useSensors();
  const sensors = allSensors.filter((s) => typeof s.value === "number");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [preset, setPreset] = useState(presets[2]);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (selectedIds.length === 0 && sensors.length > 0) {
      setSelectedIds(sensors.slice(0, 2).map((s) => s.id));
    }
  }, [sensors, selectedIds.length]);

  const toggleSensor = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) return;
    setGenerating(true);
    const now = new Date();
    const from = subHours(now, preset.hours);
    const data = await generateReport({
      sensorIds: selectedIds,
      from: from.toISOString(), to: now.toISOString(), interval: preset.interval,
    });
    setReports(data);
    setGenerating(false);
    setGenerated(true);
  };

  const mergedChartData = (() => {
    if (reports.length === 0) return [];
    const maxLen = Math.max(...reports.map((r) => r.readings.length));
    return Array.from({ length: maxLen }, (_, i) => {
      const point: Record<string, number | string> = { time: reports[0].readings[i]?.timestamp ?? "" };
      reports.forEach((r) => {
        const val = r.readings[i]?.value;
        if (typeof val === "number") point[r.sensorName] = val;
      });
      return point;
    });
  })();

  const gridColor = isDark ? "#282d35" : "#f0f1f3";
  const tickColor = isDark ? "#4a5060" : "#b0b8c4";

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Настройка отчёта</h2>

        <div className="space-y-5">
          <div>
            <label className="text-xs text-[var(--text-faint)] mb-2 block">Временной диапазон</label>
            <div className="flex gap-1.5 flex-wrap">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPreset(p)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                    preset.label === p.label
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--text-faint)] mb-2 block">
              Датчики ({selectedIds.length} выбрано)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {sensors.map((s) => (
                <label
                  key={s.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all",
                    selectedIds.includes(s.id)
                      ? "border-[var(--accent-muted)] bg-[var(--accent-soft)]"
                      : "border-[var(--card-border)] hover:border-[var(--card-border-hover)]"
                  )}
                >
                  <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSensor(s.id)} className="accent-[var(--accent)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{s.name}</p>
                    <p className="text-xs text-[var(--text-faint)] truncate">{s.room} · {s.unit}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || selectedIds.length === 0}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
              selectedIds.length === 0
                ? "bg-[var(--surface)] text-[var(--text-faint)] cursor-not-allowed"
                : "bg-[var(--accent)] text-white hover:opacity-90 shadow-sm"
            )}
          >
            {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Формирование...</> : <><BarChart3 className="w-4 h-4" />Сформировать отчёт</>}
          </button>
        </div>
      </div>

      {generated && reports.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {reports.map((r) => (
              <div key={r.sensorId} className="card p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-3 truncate">{r.sensorName}</p>
                <div className="grid grid-cols-3 gap-2">
                  <StatPill label="Средн." value={r.avg} unit={r.unit} />
                  <StatPill label="Мин." value={r.min} unit={r.unit} />
                  <StatPill label="Макс." value={r.max} unit={r.unit} />
                </div>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-4">
              График за {preset.label}
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mergedChartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  {reports.map((r, i) => (
                    <linearGradient key={r.sensorId} id={`rgrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={isDark ? 0.25 : 0.15} />
                      <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: `1px solid ${isDark ? "#363c47" : "#e4e7eb"}`,
                    background: isDark ? "#1e2228" : "#fff",
                    color: isDark ? "#e8eaef" : "#1a1d23",
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
                {reports.map((r, i) => (
                  <Area key={r.sensorId} type="monotone" dataKey={r.sensorName} stroke={COLORS[i % COLORS.length]} fill={`url(#rgrad-${i})`} strokeWidth={2} dot={false} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {generated && reports.length === 0 && (
        <div className="card p-12 text-center">
          <BarChart3 className="w-8 h-8 text-[var(--text-faint)] mx-auto mb-3" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">Нет данных для отображения</p>
        </div>
      )}
    </div>
  );
}
