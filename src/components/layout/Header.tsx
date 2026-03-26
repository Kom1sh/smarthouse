"use client";

import { Menu, Bell, Sun, Moon, Radio } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/lib/theme";
import { HttpPollingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
  unreadCount: number;
  connectionStatus: HttpPollingStatus;
}

const connectionLabel: Record<HttpPollingStatus, string> = {
  idle: "ESP32 idle",
  connecting: "ESP32 connect",
  connected: "ESP32 online",
  polling: "ESP32 polling",
  offline: "ESP32 offline",
  error: "ESP32 error",
};

export default function Header({
  onMenuClick,
  title,
  subtitle,
  unreadCount,
  connectionStatus,
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--card)]/85 border-b border-[var(--card-border)] px-4 sm:px-6 h-14 flex items-center">
      <div className="flex items-center justify-between gap-3 min-w-0 w-full">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden shrink-0 p-2 -ml-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1
              className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight truncate"
              suppressHydrationWarning
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div
            className={cn(
              "hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium mr-1",
              connectionStatus === "connected"
                ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                : connectionStatus === "connecting" || connectionStatus === "polling"
                ? "text-amber-600 bg-amber-50 border-amber-200"
                : "text-red-600 bg-red-50 border-red-200"
            )}
          >
            <Radio className="w-3.5 h-3.5" />
            {connectionLabel[connectionStatus]}
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors"
            title={isDark ? "Светлая тема" : "Тёмная тема"}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            href="/notifications"
            className="relative p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
