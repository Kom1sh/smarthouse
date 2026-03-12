"use client";

import { Sensor } from "@/lib/types";
import {
  cn,
  sensorTypeLabels,
  formatTimestamp,
} from "@/lib/utils";
import {
  Thermometer, Droplets, Wind, Eye, Flame, FlaskConical, Sun, Waves, DoorOpen, SquareDashedBottom,
  Battery, BatteryLow, Wifi, Clock,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/lib/theme";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  temperature: Thermometer, humidity: Droplets, pressure: Wind, motion: Eye,
  smoke: Flame, co2: FlaskConical, light: Sun, water_leak: Waves,
  door: DoorOpen, window: SquareDashedBottom,
};

interface SensorDetailCardProps {
  sensor: Sensor;
  history?: { timestamp: string; value: number }[];
}

function BatteryIcon({ level }: { level: number }) {
  if (level < 30) return <BatteryLow className="w-3.5 h-3.5 text-amber-500" />;
  return <Battery className="w-3.5 h-3.5 text-emerald-500" />;
}

export default function SensorDetailCard({ sensor, history }: SensorDetailCardProps) {
  const { isDark } = useTheme();
  const IconComponent = iconMap[sensor.type];
  const isBoolean = typeof sensor.value === "boolean";

  const valueDisplay = isBoolean
    ? sensor.value
      ? sensor.type === "motion" ? "Обнаружено" : "Да"
      : sensor.type === "motion" ? "Нет" : "Норма"
    : `${sensor.value} ${sensor.unit}`;

  const hasHistory = history && history.length > 0 && !isBoolean;
  const sampleHistory = hasHistory
    ? history.filter((_, i) => i % Math.max(1, Math.floor(history.length / 30)) === 0)
    : [];

  const statusDot =
    sensor.status === "online" ? "bg-emerald-500"
    : sensor.status === "warning" ? "bg-amber-500"
    : sensor.status === "critical" ? "bg-red-500"
    : "bg-neutral-400";

  const accentColor =
    sensor.status === "warning" ? "#f59e0b"
    : sensor.status === "critical" ? "#ef4444"
    : "#4f6ef7";

  return (
    <div className={cn(
      "card overflow-hidden",
      sensor.status === "warning" && "border-amber-300 dark:border-amber-800/50",
      sensor.status === "critical" && "border-red-300 dark:border-red-800/50",
      sensor.status === "offline" && "opacity-55",
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("w-2 h-2 rounded-full shrink-0", statusDot)} />
              <h3 className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                {sensor.name}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-faint)] truncate pl-4">
              {sensor.room} · {sensorTypeLabels[sensor.type]}
            </p>
          </div>
          {IconComponent && (
            <div className="w-8 h-8 shrink-0 rounded-lg bg-[var(--surface)] flex items-center justify-center">
              <IconComponent className="w-4 h-4 text-[var(--text-tertiary)]" />
            </div>
          )}
        </div>

        <p className={cn(
          "text-xl font-bold leading-none mb-3 tabular-nums",
          sensor.status === "warning" ? "text-amber-600 dark:text-amber-400"
          : sensor.status === "critical" ? "text-red-600 dark:text-red-400"
          : "text-[var(--text-primary)]"
        )}>
          {valueDisplay}
        </p>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1 font-mono">
            <Wifi className="w-3 h-3 text-[var(--text-faint)]" />
            {sensor.espIp}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[var(--text-faint)]" />
            {formatTimestamp(sensor.lastUpdated)}
          </span>
          {sensor.batteryLevel !== undefined && (
            <span className="flex items-center gap-1">
              <BatteryIcon level={sensor.batteryLevel} />
              {sensor.batteryLevel}%
            </span>
          )}
        </div>
      </div>

      {hasHistory && (
        <div className="px-1 pb-1">
          <ResponsiveContainer width="100%" height={50}>
            <AreaChart data={sampleHistory} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`sfill-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity={isDark ? 0.2 : 0.12} />
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={accentColor}
                strokeWidth={1.5}
                fill={`url(#sfill-${sensor.id})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
