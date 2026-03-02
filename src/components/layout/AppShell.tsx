"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { getNotifications } from "@/lib/api";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Дашборд", subtitle: "Обзор системы умного дома" },
  "/sensors": { title: "Датчики", subtitle: "Мониторинг всех датчиков в реальном времени" },
  "/notifications": { title: "Уведомления", subtitle: "Оповещения и события системы" },
  "/house": { title: "О доме", subtitle: "Информация о помещениях и устройствах ESP" },
  "/reports": { title: "Отчёты", subtitle: "Сводка показателей датчиков за период" },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  const pageInfo = pageTitles[pathname] ?? { title: "SmartHome", subtitle: "" };

  useEffect(() => {
    getNotifications().then((ns) => {
      setUnreadCount(ns.filter((n) => !n.read).length);
    });
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCount={unreadCount}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          unreadCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
