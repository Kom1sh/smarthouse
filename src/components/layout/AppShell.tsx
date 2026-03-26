"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MqttBootstrap from "./MqttBootstrap";
import { useUnreadCount, useHttpPollingState } from "@/lib/hooks";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Дашборд", subtitle: "Обзор системы умного дома" },
  "/sensors": { title: "Датчики", subtitle: "Управление и мониторинг" },
  "/notifications": { title: "Уведомления", subtitle: "Оповещения и события" },
  "/house": { title: "О доме", subtitle: "Помещения и устройства" },
  "/reports": { title: "Отчёты", subtitle: "Сводка за период" },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unreadCount = useUnreadCount();
  const pollingState = useHttpPollingState();
  const pathname = usePathname();

  const pageInfo = pageTitles[pathname] ?? { title: "SmartHome", subtitle: "" };

  return (
    <div className="flex h-screen overflow-hidden">
      <MqttBootstrap />
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
          connectionStatus={pollingState.status}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto p-4 sm:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
