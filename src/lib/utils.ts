import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SensorType, SensorStatus, NotificationSeverity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}д ${hours}ч`;
  if (hours > 0) return `${hours}ч ${mins}м`;
  return `${mins}м`;
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "только что";
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  return `${diffDays} д. назад`;
}

export const sensorTypeLabels: Record<SensorType, string> = {
  temperature: "Температура",
  humidity: "Влажность",
  pressure: "Давление",
  motion: "Движение",
  smoke: "Дым",
  co2: "CO₂",
  light: "Освещённость",
  water_leak: "Протечка",
  door: "Дверь",
  window: "Окно",
};

export const sensorStatusColors: Record<SensorStatus, string> = {
  online: "text-emerald-600 bg-emerald-50",
  offline: "text-slate-500 bg-slate-100",
  warning: "text-amber-600 bg-amber-50",
  critical: "text-red-600 bg-red-50",
};

export const sensorStatusLabels: Record<SensorStatus, string> = {
  online: "Онлайн",
  offline: "Офлайн",
  warning: "Предупреждение",
  critical: "Критично",
};

export const notificationSeverityColors: Record<NotificationSeverity, string> = {
  info: "text-blue-600 bg-blue-50 border-blue-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  critical: "text-red-600 bg-red-50 border-red-200",
};

export const notificationSeverityLabels: Record<NotificationSeverity, string> = {
  info: "Инфо",
  warning: "Предупреждение",
  critical: "Критично",
};

export function getSensorIcon(type: SensorType): string {
  const icons: Record<SensorType, string> = {
    temperature: "🌡️",
    humidity: "💧",
    pressure: "🔵",
    motion: "👁️",
    smoke: "🔥",
    co2: "🫧",
    light: "💡",
    water_leak: "🚿",
    door: "🚪",
    window: "🪟",
  };
  return icons[type];
}

export function getStatusDot(status: SensorStatus): string {
  const dots: Record<SensorStatus, string> = {
    online: "bg-emerald-500",
    offline: "bg-slate-400",
    warning: "bg-amber-500",
    critical: "bg-red-500",
  };
  return dots[status];
}
