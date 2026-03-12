import { Notification } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const icons = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};

const sevColor = {
  info: "text-blue-500",
  warning: "text-amber-500",
  critical: "text-red-500",
};

const sevBg = {
  info: "bg-blue-50 dark:bg-blue-950/40",
  warning: "bg-amber-50 dark:bg-amber-950/40",
  critical: "bg-red-50 dark:bg-red-950/40",
};

interface RecentAlertsProps {
  notifications: Notification[];
}

export default function RecentAlerts({ notifications }: RecentAlertsProps) {
  const recent = notifications.slice(0, 5);

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-[var(--card-border)]">
        <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Последние события
        </h2>
        <Link
          href="/notifications"
          className="text-xs text-[var(--accent)] hover:underline font-medium"
        >
          Все →
        </Link>
      </div>

      <div className="divide-y divide-[var(--card-border)]">
        {recent.length === 0 ? (
          <div className="px-4 py-10 text-sm text-[var(--text-tertiary)] text-center">
            Нет событий
          </div>
        ) : (
          recent.map((n) => {
            const Icon = icons[n.severity];

            return (
              <div
                key={n.id}
                className={cn(
                  "px-4 py-3 flex items-start gap-3 transition-colors",
                  !n.read && "bg-[var(--accent-soft)]/50"
                )}
              >
                <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", sevBg[n.severity])}>
                  <Icon className={cn("w-3.5 h-3.5", sevColor[n.severity])} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5 line-clamp-1">
                    {n.message}
                  </p>
                </div>
                <span className="text-[11px] text-[var(--text-faint)] shrink-0 mt-1">
                  {formatTimestamp(n.timestamp)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
