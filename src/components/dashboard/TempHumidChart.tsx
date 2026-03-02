"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/lib/theme";

interface ChartPoint {
  timestamp: string;
  value: number;
}

interface TempHumidChartProps {
  tempData: ChartPoint[];
  humidData: ChartPoint[];
}

export default function TempHumidChart({ tempData, humidData }: TempHumidChartProps) {
  const { isDark } = useTheme();

  const merged = tempData.map((t, i) => ({
    time: t.timestamp,
    "Температура (°C)": t.value,
    "Влажность (%)": humidData[i]?.value ?? null,
  }));

  const sample = merged.filter((_, i) => i % 4 === 0);

  const gridColor = isDark ? "#1e293b" : "#f1f5f9";
  const tickColor = isDark ? "#475569" : "#94a3b8";
  const tooltipBg = isDark ? "#0f172a" : "#ffffff";
  const tooltipBorder = isDark ? "#1e293b" : "#e2e8f0";
  const tooltipText = isDark ? "#e2e8f0" : "#1e293b";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
      <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Температура и влажность — Гостиная
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={sample} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: tickColor }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: tickColor }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: `1px solid ${tooltipBorder}`,
              background: tooltipBg,
              color: tooltipText,
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.2)",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
          <Line
            type="monotone"
            dataKey="Температура (°C)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="Влажность (%)"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
