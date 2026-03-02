"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  CheckCircle,
  WifiOff,
  TriangleAlert,
  Bell,
  Wifi,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import SensorMiniCard from "@/components/dashboard/SensorMiniCard";
import RecentAlerts from "@/components/dashboard/RecentAlerts";
import TempHumidChart from "@/components/dashboard/TempHumidChart";
import { getDashboardStats, getAllSensors, getNotifications, getSensorHistory } from "@/lib/api";
import { DashboardStats, Sensor, Notification } from "@/lib/types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tempHistory, setTempHistory] = useState<{ timestamp: string; value: number }[]>([]);
  const [humidHistory, setHumidHistory] = useState<{ timestamp: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [s, sns, notifs, temp, humid] = await Promise.all([
        getDashboardStats(),
        getAllSensors(),
        getNotifications(),
        getSensorHistory("s1"),
        getSensorHistory("s2"),
      ]);
      setStats(s);
      setSensors(sns);
      setNotifications(notifs);
      setTempHistory(temp);
      setHumidHistory(humid);
      setLoading(false);
    }
    load();
  }, []);

  const warningSensors = sensors.filter((s) => s.status === "warning" || s.status === "critical");
  const prioritySensors = [
    ...warningSensors,
    ...sensors.filter((s) => s.status === "offline"),
    ...sensors.filter((s) => s.status === "online"),
  ].slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Датчиков"
          value={stats?.totalSensors ?? 0}
          icon={Cpu}
          color="blue"
          trend="всего в системе"
        />
        <StatCard
          label="Онлайн"
          value={stats?.onlineSensors ?? 0}
          icon={CheckCircle}
          color="emerald"
          trend="работают"
        />
        <StatCard
          label="Офлайн"
          value={stats?.offlineSensors ?? 0}
          icon={WifiOff}
          color="slate"
          trend="не отвечают"
        />
        <StatCard
          label="Внимание"
          value={stats?.warningSensors ?? 0}
          icon={TriangleAlert}
          color="amber"
          trend="требуют проверки"
        />
        <StatCard
          label="Уведомлений"
          value={stats?.unreadNotifications ?? 0}
          icon={Bell}
          color="red"
          trend="непрочитанных"
        />
        <StatCard
          label="ESP онлайн"
          value={`${stats?.espOnline}/${stats?.espDevices}`}
          icon={Wifi}
          color="cyan"
          trend="устройств"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <TempHumidChart tempData={tempHistory} humidData={humidHistory} />
        </div>
        <div>
          <RecentAlerts notifications={notifications} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">Приоритетные датчики</h2>
          <a
            href="/sensors"
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Все датчики →
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {prioritySensors.map((sensor) => (
            <SensorMiniCard key={sensor.id} sensor={sensor} />
          ))}
        </div>
      </div>
    </div>
  );
}
