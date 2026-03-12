import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "emerald" | "amber" | "red" | "slate" | "cyan";
  trend?: string;
}

const colorMap: Record<string, { accent: string; iconBg: string; icon: string }> = {
  blue: {
    accent: "bg-blue-500",
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    icon: "text-blue-600 dark:text-blue-400",
  },
  emerald: {
    accent: "bg-emerald-500",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    icon: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    accent: "bg-amber-500",
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    icon: "text-amber-600 dark:text-amber-400",
  },
  red: {
    accent: "bg-red-500",
    iconBg: "bg-red-50 dark:bg-red-950/40",
    icon: "text-red-600 dark:text-red-400",
  },
  slate: {
    accent: "bg-neutral-400 dark:bg-neutral-600",
    iconBg: "bg-neutral-100 dark:bg-neutral-800",
    icon: "text-neutral-500 dark:text-neutral-400",
  },
  cyan: {
    accent: "bg-cyan-500",
    iconBg: "bg-cyan-50 dark:bg-cyan-950/40",
    icon: "text-cyan-600 dark:text-cyan-400",
  },
};

export default function StatCard({ label, value, icon: Icon, color, trend }: StatCardProps) {
  const c = colorMap[color];

  return (
    <div className="card p-4 relative overflow-hidden">
      <div className={cn("absolute top-0 left-0 w-full h-[3px] rounded-t-[14px]", c.accent)} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-xs text-[var(--text-tertiary)] font-medium mb-2 truncate">{label}</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] leading-none tabular-nums">
            {value}
          </p>
          {trend && (
            <p className="text-[11px] text-[var(--text-faint)] mt-1.5 truncate">{trend}</p>
          )}
        </div>
        <div className={cn("w-10 h-10 shrink-0 rounded-xl flex items-center justify-center", c.iconBg)}>
          <Icon className={cn("w-5 h-5", c.icon)} />
        </div>
      </div>
    </div>
  );
}
