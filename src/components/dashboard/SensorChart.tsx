"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { X } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface SensorChartProps {
  sensorId: string;
  sensorName: string;
  unit: string;
  color: string;
  history: { timestamp: string; value: number }[];
  hoursRange: number;
  onRemove: () => void;
  onRangeChange: (hours: number) => void;
}

const RANGE_OPTIONS = [
  { label: "1ч", hours: 1 },
  { label: "6ч", hours: 6 },
  { label: "24ч", hours: 24 },
];

export default function SensorChart({
  sensorName,
  unit,
  color,
  history,
  hoursRange,
  onRemove,
  onRangeChange,
}: SensorChartProps) {
  const { isDark } = useTheme();

  const data = useMemo(() => {
    const pointsPerHour = 4;
    const totalPoints = hoursRange * pointsPerHour;
    const sliced = history.slice(-totalPoints);
    if (sliced.length <= 40) return sliced;
    const step = Math.max(1, Math.floor(sliced.length / 40));
    return sliced.filter((_, i) => i % step === 0);
  }, [history, hoursRange]);

  const lastValue = history.length > 0 ? history[history.length - 1].value : null;

  const gridColor = isDark ? "#282d35" : "#f0f1f3";
  const tickColor = isDark ? "#4a5060" : "#b0b8c4";

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 0 3px ${color}20, 0 0 8px ${color}30` }} />
          <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
            {sensorName}
          </span>
          {lastValue !== null && (
            <span className="text-xs font-mono text-[var(--text-tertiary)] bg-[var(--surface)] px-2 py-0.5 rounded shrink-0">
              {lastValue} {unit}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className="flex bg-[var(--surface)] rounded-lg p-0.5">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.hours}
                onClick={() => onRangeChange(opt.hours)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                  hoursRange === opt.hours
                    ? "bg-[var(--card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-0.5"
            title="Убрать график"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={isDark ? 0.25 : 0.15} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="timestamp"
            tick={{ fontSize: 10, fill: tickColor }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: tickColor }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "10px",
              border: `1px solid ${isDark ? "#363c47" : "#e4e7eb"}`,
              background: isDark ? "#1e2228" : "#fff",
              color: isDark ? "#e8eaef" : "#1a1d23",
              fontSize: 12,
              padding: "8px 12px",
              boxShadow: "0 4px 12px rgb(0 0 0 / 0.1)",
            }}
            formatter={(value: number | undefined) => value !== undefined ? [`${value} ${unit}`, sensorName] : []}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#fill-${color.replace("#", "")})`}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 0, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
