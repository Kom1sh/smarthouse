"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  CheckCircle,
  WifiOff,
  TriangleAlert,
  Bell,
  Plus,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import HomeStatusBanner from "@/components/dashboard/HomeStatusBanner";
import RoomOverview from "@/components/dashboard/RoomOverview";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import ChartManager from "@/components/dashboard/ChartManager";
import MqttControlPanel from "@/components/dashboard/MqttControlPanel";
import AddSensorModal from "@/components/sensors/AddSensorModal";
import { useSensors, useNotifications, useHttpPollingState } from "@/lib/hooks";

export default function DashboardPage() {
  const sensors = useSensors();
  const notifications = useNotifications();
  const pollingState = useHttpPollingState();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalSensors = sensors.length;
  const onlineSensors = sensors.filter((s) => s.status === "online").length;
  const offlineSensors = sensors.filter((s) => s.status === "offline").length;
  const warningSensors = sensors.filter(
    (s) => s.status === "warning" || s.status === "critical"
  ).length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-[var(--card-border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HomeStatusBanner sensors={sensors} notifications={notifications} pollingState={pollingState} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Датчиков" value={totalSensors} icon={Cpu} color="blue" trend="в системе" />
        <StatCard label="Онлайн" value={onlineSensors} icon={CheckCircle} color="emerald" trend="передают данные" />
        <StatCard label="Офлайн" value={offlineSensors} icon={WifiOff} color="slate" trend="нет свежего JSON" />
        <StatCard label="Внимание" value={warningSensors} icon={TriangleAlert} color="amber" trend="вышли за пороги" />
        <StatCard label="Уведомления" value={unreadCount} icon={Bell} color="red" trend="непрочитанных" />
      </div>

      <MqttControlPanel />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ChartManager />
          <RoomOverview sensors={sensors} />
        </div>
        <div className="space-y-4">
          <RecentAlerts notifications={notifications} />

          <button
            onClick={() => setAddModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--card-border)] text-[var(--text-tertiary)] hover:border-[var(--accent-muted)] hover:text-[var(--accent)] transition-all text-[13px] font-medium"
          >
            <Plus className="w-4 h-4" />
            Добавить датчик
          </button>
        </div>
      </div>

      <AddSensorModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
