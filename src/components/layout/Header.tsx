"use client";

import { Menu, Bell, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/lib/theme";

interface HeaderProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
  unreadCount: number;
}

export default function Header({
  onMenuClick,
  title,
  subtitle,
  unreadCount,
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
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors"
            aria-label="Переключить тему"
          >
            {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          <Link
            href="/notifications"
            className="relative p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--card-hover)] transition-colors"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[var(--card)]" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
