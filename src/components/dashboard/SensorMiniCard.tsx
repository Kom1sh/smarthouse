import { Sensor } from "@/lib/types";
import { cn, getStatusDot, sensorTypeLabels } from "@/lib/utils";
import Link from "next/link";
import { BatteryLow, Thermometer, Droplets, Wind, Eye, Flame, FlaskConical, Sun, Waves } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  temperature: Thermometer,
  humidity: Droplets,
  pressure: Wind,
  motion: Eye,
  smoke: Flame,
  co2: FlaskConical,
  light: Sun,
  water_leak: Waves,
};

interface SensorMiniCardProps {
  sensor: Sensor;
}

export default function SensorMiniCard({ sensor }: SensorMiniCardProps) {
  const IconComponent = iconMap[sensor.type];
  const isBoolean = typeof sensor.value === "boolean";

  const valueDisplay = isBoolean
    ? sensor.value
      ? sensor.type === "motion" ? "Есть движение" : "Обнаружено"
      : sensor.type === "motion" ? "Нет движения" : "Норма"
    : `${sensor.value}${sensor.unit}`;

  const valueClass =
    sensor.status === "online"
      ? "text-slate-900 dark:text-slate-100"
      : sensor.status === "warning"
      ? "text-amber-700 dark:text-amber-400"
      : sensor.status === "critical"
      ? "text-red-700 dark:text-red-400"
      : "text-slate-400 dark:text-slate-500";

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

  return (
    <Link href={`/sensors?id=${sensor.id}`}>
      <div
        className={cn(
          "bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-3 sm:p-4",
          "hover:shadow-md transition-all duration-200 cursor-pointer",
          "border-slate-100 dark:border-slate-800",
          sensor.status === "warning" &&
            "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20",
          sensor.status === "critical" &&
            "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20",
          sensor.status === "offline" && "opacity-60"
        )}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {IconComponent && (
              <div className={cn("w-7 h-7 shrink-0 rounded-lg flex items-center justify-center", iconBg)}>
                <IconComponent className={cn("w-3.5 h-3.5", iconColor)} />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-tight truncate">
                {sensorTypeLabels[sensor.type]}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{sensor.room}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-1">
            <span className={cn("w-1.5 h-1.5 rounded-full", getStatusDot(sensor.status))} />
            {sensor.batteryLevel !== undefined && sensor.batteryLevel < 30 && (
              <BatteryLow className="w-3 h-3 text-amber-500" />
            )}
          </div>
        </div>

        <div>
          <p className={cn("text-lg font-bold leading-tight truncate", valueClass)}>
            {valueDisplay}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{sensor.name}</p>
        </div>
      </div>
    </Link>
  );
}
