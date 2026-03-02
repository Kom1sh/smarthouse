"use client";

import { Sensor } from "@/lib/types";
import {
  cn,
  sensorTypeLabels,
  sensorStatusColors,
  sensorStatusLabels,
  formatTimestamp,
} from "@/lib/utils";
import {
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Flame,
  FlaskConical,
  Sun,
  Waves,
  DoorOpen,
  SquareDashedBottom,
  Battery,
  BatteryLow,
  Wifi,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/lib/theme";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  temperature: Thermometer,
  humidity: Droplets,
  pressure: Wind,
  motion: Eye,
  smoke: Flame,
  co2: FlaskConical,
  light: Sun,
  water_leak: Waves,
  door: DoorOpen,
  window: SquareDashedBottom,
};

const darkStatusColors: Record<string, string> = {
  "text-emerald-600 bg-emerald-50": "dark:text-emerald-400 dark:bg-emerald-950/50",
  "text-slate-500 bg-slate-100": "dark:text-slate-400 dark:bg-slate-800",
  "text-amber-600 bg-amber-50": "dark:text-amber-400 dark:bg-amber-950/50",
  "text-red-600 bg-red-50": "dark:text-red-400 dark:bg-red-950/50",
};

interface SensorDetailCardProps {
  sensor: Sensor;
  history?: { timestamp: string; value: number }[];
}

function BatteryIcon({ level }: { level: number }) {
  if (level < 30) return <BatteryLow className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
  return <Battery className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
}

export default function SensorDetailCard({ sensor, history }: SensorDetailCardProps) {
  const { isDark } = useTheme();
  const IconComponent = iconMap[sensor.type];
  const isBoolean = typeof sensor.value === "boolean";

  const valueDisplay = isBoolean
    ? sensor.value
      ? sensor.type === "motion" ? "Движение обнаружено" : "Обнаружено"
      : sensor.type === "motion" ? "Движения нет" : "Норма"
    : `${sensor.value} ${sensor.unit}`;

  const lightStatusStyle = sensorStatusColors[sensor.status];
  const darkStatusStyle = darkStatusColors[lightStatusStyle] ?? "";

  const hasHistory = history && history.length > 0 && !isBoolean;
  const sampleHistory = hasHistory
    ? history.filter((_, i) => i % Math.max(1, Math.floor(history.length / 30)) === 0)
    : [];

  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const tickColor = isDark ? "#475569" : "#cbd5e1";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#1e293b" : "#e2e8f0";
  const tooltipText = isDark ? "#e2e8f0" : "#1e293b";

  const iconBg =
    sensor.status === "warning"
      ? "bg-amber-100 dark:bg-amber-950/60"
      : sensor.status === "critical"
      ? "bg-red-100 dark:bg-red-950/60"
      : sensor.status === "offline"
      ? "bg-slate-100 dark:bg-slate-800"
      : "bg-blue-50 dark:bg-blue-950/50";

  const iconColor =
    sensor.status === "warning"
      ? "text-amber-600 dark:text-amber-400"
      : sensor.status === "critical"
      ? "text-red-600 dark:text-red-400"
      : sensor.status === "offline"
      ? "text-slate-400 dark:text-slate-500"
      : "text-blue-600 dark:text-blue-400";

  const valueColor =
    sensor.status === "warning"
      ? "text-amber-700 dark:text-amber-400"
      : sensor.status === "critical"
      ? "text-red-700 dark:text-red-400"
      : sensor.status === "offline"
      ? "text-slate-400 dark:text-slate-500"
      : "text-slate-900 dark:text-slate-100";

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden",
        sensor.status === "warning"
          ? "border-amber-200 dark:border-amber-800"
          : sensor.status === "critical"
          ? "border-red-200 dark:border-red-800"
          : sensor.status === "offline"
          ? "border-slate-200 dark:border-slate-700 opacity-70"
          : "border-slate-100 dark:border-slate-800"
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("w-10 h-10 shrink-0 rounded-xl flex items-center justify-center", iconBg)}>
              {IconComponent && <IconComponent className={cn("w-5 h-5", iconColor)} />}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight truncate">
                {sensor.name}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                {sensor.room} · {sensorTypeLabels[sensor.type]}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
              lightStatusStyle,
              darkStatusStyle
            )}
          >
            {sensorStatusLabels[sensor.status]}
          </span>
        </div>

        <div className="mb-4">
          <p className={cn("text-2xl font-bold leading-none truncate", valueColor)}>
            {valueDisplay}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
            <Wifi className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate font-mono">{sensor.espIp}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">{formatTimestamp(sensor.lastUpdated)}</span>
          </div>
          {sensor.batteryLevel !== undefined && (
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <BatteryIcon level={sensor.batteryLevel} />
              <span>{sensor.batteryLevel}%</span>
            </div>
          )}
          {sensor.minThreshold !== undefined && (
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
              <span className="text-slate-400 dark:text-slate-500 shrink-0">Диапазон:</span>
              <span className="truncate">
                {sensor.minThreshold}–{sensor.maxThreshold} {sensor.unit}
              </span>
            </div>
          )}
        </div>
      </div>

      {hasHistory && (
        <div className="px-4 pb-4">
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">За последние 24 ч.</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={sampleHistory} margin={{ top: 2, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 9, fill: tickColor }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: tickColor }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: `1px solid ${tooltipBorder}`,
                  background: tooltipBg,
                  color: tooltipText,
                  fontSize: 11,
                  padding: "4px 8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
