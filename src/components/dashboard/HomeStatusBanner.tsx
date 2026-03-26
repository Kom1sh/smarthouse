"use client";

import { Sensor, Notification, HttpPollingStateSnapshot } from "@/lib/types";
import { ShieldCheck, ShieldAlert, ShieldX, Clock, Radio } from "lucide-react";
import { cn, formatTimestamp } from "@/lib/utils";

interface HomeStatusBannerProps {
  sensors: Sensor[];
  notifications: Notification[];
  pollingState: HttpPollingStateSnapshot;
}

type OverallStatus = "ok" | "warning" | "critical";

function getOverallStatus(
  sensors: Sensor[],
  notifications: Notification[],
  pollingState: HttpPollingStateSnapshot
): {
  status: OverallStatus;
  title: string;
  subtitle: string;
} {
  if (pollingState.status === "error" || pollingState.status === "offline") {
    return {
      status: "critical",
      title: "ESP32 недоступен",
      subtitle: "Фронтенд не может стабильно забрать JSON с устройства. Проверьте IP, CORS и доступность /sensors.",
    };
  }

  if (!pollingState.usingLiveData) {
    return {
      status: "warning",
      title: "Ожидание телеметрии",
      subtitle: "Фронтенд уже опрашивает ESP32, но первый успешный ответ с /sensors ещё не пришёл.",
    };
  }

  const criticalSensors = sensors.filter((s) => s.status === "critical" || s.status === "offline");
  const warningSensors = sensors.filter((s) => s.status === "warning");
  const unreadCritical = notifications.filter((n) => !n.read && n.severity === "critical");

  if (criticalSensors.length > 0 || unreadCritical.length > 0) {
    return {
      status: "critical",
      title: "Требуется внимание",
      subtitle: `${criticalSensors.length} датчик(ов) в критическом состоянии. Проверьте уведомления и последние значения.`,
    };
  }

  if (warningSensors.length > 0) {
    return {
      status: "warning",
      title: "Есть предупреждения",
      subtitle: `${warningSensors.length} датчик(ов) вышли за рабочий диапазон. Фронтенд продолжает опрос устройства.`,
    };
  }

  return {
    status: "ok",
    title: "Система на связи",
    subtitle: "ESP32 отдаёт JSON по HTTP, а фронтенд регулярно забирает новые значения с /sensors.",
  };
}

const cfg = {
  ok: {
    icon: ShieldCheck,
    gradient: "from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700",
    ring: "ring-emerald-400/30 dark:ring-emerald-500/20",
  },
  warning: {
    icon: ShieldAlert,
    gradient: "from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600",
    ring: "ring-amber-400/30 dark:ring-amber-500/20",
  },
  critical: {
    icon: ShieldX,
    gradient: "from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700",
    ring: "ring-red-400/30 dark:ring-red-500/20",
  },
};

export default function HomeStatusBanner({ sensors, notifications, pollingState }: HomeStatusBannerProps) {
  const { status, title, subtitle } = getOverallStatus(sensors, notifications, pollingState);
  const c = cfg[status];
  const Icon = c.icon;
  const onlineCount = sensors.filter((s) => s.status === "online").length;

  const timeStr = new Date().toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("rounded-2xl bg-gradient-to-r text-white p-5 shadow-md", c.gradient)}>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 shrink-0 rounded-xl bg-white/20 flex items-center justify-center ring-4 backdrop-blur-sm",
            c.ring
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
          <p className="text-sm text-white/75 mt-1 leading-snug">{subtitle}</p>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 text-[13px] bg-white/15 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
              {onlineCount} из {sensors.length} онлайн
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] bg-white/15 backdrop-blur-sm px-3 py-1 rounded-lg">
              <Radio className="w-3.5 h-3.5" />
              HTTP: {pollingState.status}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-white/60">
              <Clock className="w-3.5 h-3.5" />
              {timeStr}
            </span>
            {pollingState.lastSuccessAt && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-white/60">
                Последний ответ: {formatTimestamp(pollingState.lastSuccessAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
