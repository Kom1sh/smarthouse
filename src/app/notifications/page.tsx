"use client";

import { useEffect, useState } from "react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api";
import { Notification, NotificationSeverity } from "@/lib/types";
import {
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCheck,
  BellOff,
} from "lucide-react";
import {
  cn,
  formatTimestamp,
  notificationSeverityLabels,
} from "@/lib/utils";

const severityIcons: Record<NotificationSeverity, React.ComponentType<{ className?: string }>> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};

const severityLight: Record<NotificationSeverity, string> = {
  info: "text-blue-600 bg-blue-50 border-blue-200",
  warning: "text-amber-600 bg-amber-50 border-amber-200",
  critical: "text-red-600 bg-red-50 border-red-200",
};

const severityDark: Record<NotificationSeverity, string> = {
  info: "dark:text-blue-400 dark:bg-blue-950/50 dark:border-blue-800",
  warning: "dark:text-amber-400 dark:bg-amber-950/50 dark:border-amber-800",
  critical: "dark:text-red-400 dark:bg-red-950/50 dark:border-red-800",
};

type FilterSeverity = "all" | NotificationSeverity;

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterSeverity>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter !== "all" && n.severity !== filter) return false;
    if (showUnreadOnly && n.read) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const counts = {
    all: notifications.length,
    info: notifications.filter((n) => n.severity === "info").length,
    warning: notifications.filter((n) => n.severity === "warning").length,
    critical: notifications.filter((n) => n.severity === "critical").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 flex-wrap">
          {(["all", "critical", "warning", "info"] as FilterSeverity[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
                filter === s
                  ? s === "all"
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                    : s === "critical"
                    ? "bg-red-500 text-white"
                    : s === "warning"
                    ? "bg-amber-500 text-white"
                    : "bg-blue-500 text-white"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              )}
            >
              {s === "all" ? "Все" : notificationSeverityLabels[s]} ({counts[s]})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setShowUnreadOnly((v) => !v)}
              className={cn(
                "w-9 h-5 rounded-full transition-colors relative cursor-pointer",
                showUnreadOnly ? "bg-blue-500" : "bg-slate-200 dark:bg-slate-700"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                  showUnreadOnly ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
              Только непрочитанные
            </span>
          </label>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 rounded-xl transition-colors whitespace-nowrap"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Прочитать все
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-16 text-center">
          <BellOff className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Нет уведомлений</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            {showUnreadOnly ? "Все уведомления прочитаны" : "Система работает штатно"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const Icon = severityIcons[n.severity];

            return (
              <div
                key={n.id}
                className={cn(
                  "bg-white dark:bg-slate-900 rounded-2xl border p-4 transition-all",
                  !n.read
                    ? "border-blue-100 dark:border-blue-900 shadow-sm"
                    : "border-slate-100 dark:border-slate-800"
                )}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={cn(
                      "p-2 rounded-xl border mt-0.5 shrink-0",
                      severityLight[n.severity],
                      severityDark[n.severity]
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-snug">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {n.room && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                              📍 {n.room}
                            </span>
                          )}
                          {n.sensorName && (
                            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                              🔧 {n.sensorName}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {formatTimestamp(n.timestamp)}
                          </span>
                        </div>
                      </div>

                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          title="Отметить как прочитанное"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
