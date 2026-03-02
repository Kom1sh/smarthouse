import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "emerald" | "amber" | "red" | "slate" | "cyan";
  trend?: string;
}

const colorMap: Record<string, { bg: string; icon: string; trend: string }> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/50",
    icon: "text-blue-600 dark:text-blue-400",
    trend: "text-blue-600 dark:text-blue-400",
  },
  emerald: {
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    icon: "text-emerald-600 dark:text-emerald-400",
    trend: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    icon: "text-amber-600 dark:text-amber-400",
    trend: "text-amber-600 dark:text-amber-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/50",
    icon: "text-red-600 dark:text-red-400",
    trend: "text-red-600 dark:text-red-400",
  },
  slate: {
    bg: "bg-slate-100 dark:bg-slate-800",
    icon: "text-slate-600 dark:text-slate-400",
    trend: "text-slate-500 dark:text-slate-500",
  },
  cyan: {
    bg: "bg-cyan-50 dark:bg-cyan-950/50",
    icon: "text-cyan-600 dark:text-cyan-400",
    trend: "text-cyan-600 dark:text-cyan-400",
  },
};

export default function StatCard({ label, value, icon: Icon, color, trend }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 truncate">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-none truncate">
            {value}
          </p>
          {trend && (
            <p className={cn("text-xs mt-1 font-medium truncate", c.trend)}>{trend}</p>
          )}
        </div>
        <div className={cn("w-10 h-10 shrink-0 rounded-xl flex items-center justify-center", c.bg)}>
          <Icon className={cn("w-5 h-5", c.icon)} />
        </div>
      </div>
    </div>
  );
}
