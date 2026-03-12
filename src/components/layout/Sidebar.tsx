"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  Bell,
  Home,
  BarChart3,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Дашборд", icon: LayoutDashboard },
  { href: "/sensors", label: "Датчики", icon: Cpu },
  { href: "/notifications", label: "Уведомления", icon: Bell },
  { href: "/house", label: "О доме", icon: Home },
  { href: "/reports", label: "Отчёты", icon: BarChart3 },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  unreadCount: number;
}

export default function Sidebar({ mobileOpen, onClose, unreadCount }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-[220px] flex flex-col transition-transform duration-300",
          "bg-[var(--card)] border-r border-[var(--card-border)]",
          "lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="SmartHome" width={28} height={28} className="shrink-0" />
            <span className="font-semibold text-[var(--text-primary)] text-[13px] tracking-tight">
              SmartHome
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden shrink-0 p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-[13px] transition-all duration-100 relative",
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] font-semibold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--accent)]" />
                )}
                <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-[var(--accent)]")} />
                <span className="flex-1 min-w-0 truncate">{label}</span>
                {href === "/notifications" && unreadCount > 0 && (
                  <span className="shrink-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-[var(--card-border)]">
          <div className="flex items-center gap-2 px-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">Система активна</span>
          </div>
        </div>
      </aside>
    </>
  );
}
