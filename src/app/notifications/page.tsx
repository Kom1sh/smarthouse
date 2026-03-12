"use client";

import { useEffect, useState } from "react";
import { NotificationSeverity } from "@/lib/types";
import { AlertTriangle, Info, AlertCircle, CheckCheck, BellOff } from "lucide-react";
import { cn, formatTimestamp, notificationSeverityLabels } from "@/lib/utils";
import { sensorStore } from "@/lib/sensorStore";
import { useNotifications } from "@/lib/hooks";

const severityIcons: Record<NotificationSeverity, React.ComponentType<{ className?: string }>> = {
  info: Info, warning: AlertTriangle, critical: AlertCircle,
};

const sevColor: Record<NotificationSeverity, string> = {
  info: "text-blue-500", warning: "text-amber-500", critical: "text-red-500",
};

const sevBg: Record<NotificationSeverity, string> = {
  info: "bg-blue-50 dark:bg-blue-950/40",
  warning: "bg-amber-50 dark:bg-amber-950/40",
  critical: "bg-red-50 dark:bg-red-950/40",
};

type FilterSeverity = "all" | NotificationSeverity;

export default function NotificationsPage() {
  const notifications = useNotifications();
  const [filter, setFilter] = useState<FilterSeverity>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleMarkRead = (id: string) => { sensorStore.markNotificationRead(id); };
  const handleMarkAll = () => { sensorStore.markAllNotificationsRead(); };

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

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-[var(--card-border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "critical", "warning", "info"] as FilterSeverity[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                filter === s
                  ? s === "all" ? "bg-[var(--accent)] text-white"
                  : s === "critical" ? "bg-red-500 text-white"
                  : s === "warning" ? "bg-amber-500 text-white"
                  : "bg-blue-500 text-white"
                  : "card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
                showUnreadOnly ? "bg-[var(--accent)]" : "bg-neutral-300 dark:bg-neutral-600"
              )}
            >
              <div className={cn(
                "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                showUnreadOnly ? "translate-x-4" : "translate-x-0.5"
              )} />
            </div>
            <span className="text-xs text-[var(--text-secondary)]">Непрочитанные</span>
          </label>

          {unreadCount > 0 && (
            <button onClick={handleMarkAll} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] rounded-lg transition-colors">
              <CheckCheck className="w-3.5 h-3.5" />
              Прочитать все
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <BellOff className="w-8 h-8 text-[var(--text-faint)] mx-auto mb-3" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {showUnreadOnly ? "Все уведомления прочитаны" : "Нет уведомлений"}
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
                  "card p-4 transition-colors",
                  !n.read && "border-[var(--accent-muted)] dark:border-[var(--accent-muted)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", sevBg[n.severity])}>
                    <Icon className={cn("w-4 h-4", sevColor[n.severity])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{n.title}</p>
                          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] mt-0.5 leading-snug">{n.message}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-faint)]">
                          {n.room && <span>{n.room}</span>}
                          {n.room && n.sensorName && <span>·</span>}
                          {n.sensorName && <span>{n.sensorName}</span>}
                          <span>· {formatTimestamp(n.timestamp)}</span>
                        </div>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="shrink-0 p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
                          title="Прочитано"
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
