"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllSensors, getSensorHistory } from "@/lib/api";
import { Sensor, SensorType } from "@/lib/types";
import SensorDetailCard from "@/components/sensors/SensorDetailCard";
import { sensorTypeLabels, sensorStatusLabels } from "@/lib/utils";
import { Search, SlidersHorizontal, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "online" | "offline" | "warning" | "critical";

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [histories, setHistories] = useState<Record<string, { timestamp: string; value: number }[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterRoom, setFilterRoom] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const loadSensors = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    const data = await getAllSensors();
    setSensors(data);

    const numericSensors = data.filter((s) => typeof s.value === "number").slice(0, 6);
    const historyEntries = await Promise.all(
      numericSensors.map(async (s) => {
        const h = await getSensorHistory(s.id);
        return [s.id, h] as const;
      })
    );
    setHistories(Object.fromEntries(historyEntries));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadSensors();
    const interval = setInterval(() => loadSensors(true), 30000);
    return () => clearInterval(interval);
  }, [loadSensors]);

  const rooms = ["all", ...Array.from(new Set(sensors.map((s) => s.room)))];
  const types = ["all", ...Array.from(new Set(sensors.map((s) => s.type)))];

  const filtered = sensors.filter((s) => {
    if (filterStatus !== "all" && s.status !== filterStatus) return false;
    if (filterRoom !== "all" && s.room !== filterRoom) return false;
    if (filterType !== "all" && s.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q) ||
        s.espName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusCounts = {
    all: sensors.length,
    online: sensors.filter((s) => s.status === "online").length,
    offline: sensors.filter((s) => s.status === "offline").length,
    warning: sensors.filter((s) => s.status === "warning").length,
    critical: sensors.filter((s) => s.status === "critical").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Загрузка датчиков...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Поиск по датчику, комнате, устройству..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все комнаты</option>
            {rooms.slice(1).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Все типы</option>
            {types.slice(1).map((t) => (
              <option key={t} value={t}>{sensorTypeLabels[t as SensorType]}</option>
            ))}
          </select>

          <button
            onClick={() => loadSensors(true)}
            className={cn(
              "p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl",
              "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400",
              "hover:border-blue-300 dark:hover:border-blue-700 transition-colors",
              refreshing && "animate-spin text-blue-500"
            )}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(["all", "online", "warning", "offline", "critical"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap",
              filterStatus === s
                ? s === "all"
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : s === "online"
                  ? "bg-emerald-500 text-white"
                  : s === "warning"
                  ? "bg-amber-500 text-white"
                  : s === "offline"
                  ? "bg-slate-500 text-white"
                  : "bg-red-500 text-white"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            {s === "all" ? "Все" : sensorStatusLabels[s]} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center">
          <SlidersHorizontal className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Датчики не найдены</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sensor) => (
            <SensorDetailCard
              key={sensor.id}
              sensor={sensor}
              history={histories[sensor.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
