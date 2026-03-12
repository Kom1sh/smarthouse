"use client";

import { Sensor } from "@/lib/types";
import { cn, sensorTypeLabels, getStatusDot } from "@/lib/utils";
import {
  Thermometer, Droplets, Wind, Eye, Flame, FlaskConical, Sun, Waves, DoorOpen, SquareDashedBottom,
} from "lucide-react";

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

interface RoomOverviewProps {
  sensors: Sensor[];
}

export default function RoomOverview({ sensors }: RoomOverviewProps) {
  const rooms = Array.from(new Set(sensors.map((s) => s.room)));

  return (
    <div className="space-y-3">
      <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
        Комнаты
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rooms.map((room) => {
          const roomSensors = sensors.filter((s) => s.room === room);
          const hasIssue = roomSensors.some(
            (s) => s.status === "warning" || s.status === "critical" || s.status === "offline"
          );

          return (
            <div
              key={room}
              className={cn(
                "card p-4",
                hasIssue && "border-amber-300 dark:border-amber-800/60"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{room}</h3>
                <span
                  className={cn(
                    "text-[11px] font-medium px-2 py-0.5 rounded-full",
                    hasIssue
                      ? "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
                      : "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                  )}
                >
                  {hasIssue ? "Внимание" : "Норма"}
                </span>
              </div>

              <div className="space-y-2">
                {roomSensors.map((s) => {
                  const Icon = iconMap[s.type];
                  const isBool = typeof s.value === "boolean";
                  const displayValue = isBool
                    ? s.value ? "Да" : "Нет"
                    : `${s.value} ${s.unit}`;

                  return (
                    <div key={s.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", getStatusDot(s.status))} />
                        {Icon && <Icon className="w-3.5 h-3.5 shrink-0 text-[var(--text-faint)]" />}
                        <span className="text-[13px] text-[var(--text-secondary)] truncate">
                          {sensorTypeLabels[s.type]}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "text-[13px] font-semibold tabular-nums shrink-0 ml-3",
                          s.status === "warning"
                            ? "text-amber-600 dark:text-amber-400"
                            : s.status === "critical" || s.status === "offline"
                            ? "text-red-600 dark:text-red-400"
                            : "text-[var(--text-primary)]"
                        )}
                      >
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
