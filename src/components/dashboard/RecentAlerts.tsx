import { Notification } from "@/lib/types";
import { formatTimestamp, notificationSeverityColors } from "@/lib/utils";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const icons = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};

const darkColorClasses = {
  info: "text-blue-400 bg-blue-950/50 border-blue-800",
  warning: "text-amber-400 bg-amber-950/50 border-amber-800",
  critical: "text-red-400 bg-red-950/50 border-red-800",
};

interface RecentAlertsProps {
  notifications: Notification[];
}

export default function RecentAlerts({ notifications }: RecentAlertsProps) {
  const recent = notifications.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm h-full">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Последние уведомления</h2>
        <Link
          href="/notifications"
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium shrink-0"
        >
          Все →
        </Link>
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {recent.length === 0 ? (
          <div className="px-5 pb-8 text-sm text-slate-400 dark:text-slate-500 text-center pt-8">
            Уведомлений нет
          </div>
        ) : (
          recent.map((n) => {
            const Icon = icons[n.severity];
            const lightClass = notificationSeverityColors[n.severity];
            const darkClass = darkColorClasses[n.severity];

            return (
              <div
                key={n.id}
                className={cn(
                  "px-5 py-3 flex items-start gap-3",
                  !n.read && "bg-blue-50/40 dark:bg-blue-950/20"
                )}
              >
                <div className={cn("p-1.5 rounded-lg border mt-0.5 shrink-0", lightClass, `dark:${darkClass}`)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatTimestamp(n.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
