"use client";

import { useEffect, useState } from "react";
import { SensorType } from "@/lib/types";
import SensorDetailCard from "@/components/sensors/SensorDetailCard";
import AddSensorModal from "@/components/sensors/AddSensorModal";
import { sensorTypeLabels, sensorStatusLabels } from "@/lib/utils";
import { Search, Plus, Trash2, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { sensorStore } from "@/lib/sensorStore";
import { useSensors } from "@/lib/hooks";

type FilterStatus = "all" | "online" | "offline" | "warning" | "critical";

export default function SensorsPage() {
  const sensors = useSensors();
  const [histories, setHistories] = useState<Record<string, { timestamp: string; value: number }[]>>({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterRoom, setFilterRoom] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function updateHistories() {
      const numericSensors = sensors.filter((s) => typeof s.value === "number");
      const h: Record<string, { timestamp: string; value: number }[]> = {};
      for (const s of numericSensors) {
        h[s.id] = sensorStore.getHistory(s.id);
      }
      setHistories(h);
    }
    updateHistories();
    const unsub = sensorStore.subscribe(updateHistories);
    return unsub;
  }, [sensors]);

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

  const handleDelete = (id: string) => {
    sensorStore.removeSensor(id);
    setConfirmDeleteId(null);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-[var(--card-border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]" />
          <input
            type="text"
            placeholder="Поиск по датчику, комнате, устройству..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
          >
            <option value="all">Все комнаты</option>
            {rooms.slice(1).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2.5 bg-[var(--card)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
          >
            <option value="all">Все типы</option>
            {types.slice(1).map((t) => (
              <option key={t} value={t}>{sensorTypeLabels[t as SensorType]}</option>
            ))}
          </select>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-3 py-2.5 bg-[var(--accent)] text-white rounded-xl hover:opacity-90 transition-opacity text-sm"
            title="Добавить датчик"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {(["all", "online", "warning", "offline", "critical"] as FilterStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              filterStatus === s
                ? s === "all"
                  ? "bg-[var(--accent)] text-white"
                  : s === "online"
                  ? "bg-emerald-500 text-white"
                  : s === "warning"
                  ? "bg-amber-500 text-white"
                  : s === "offline"
                  ? "bg-neutral-500 text-white"
                  : "bg-red-500 text-white"
                : "card text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {s === "all" ? "Все" : sensorStatusLabels[s]} ({statusCounts[s]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <SlidersHorizontal className="w-8 h-8 text-[var(--text-faint)] mx-auto mb-3" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">Датчики не найдены</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Попробуйте изменить фильтры</p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Добавить датчик
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((sensor) => (
            <div key={sensor.id} className="relative group">
              <SensorDetailCard sensor={sensor} history={histories[sensor.id]} />
              <button
                onClick={() => setConfirmDeleteId(sensor.id)}
                className="absolute top-3 right-3 p-1.5 rounded-md text-[var(--text-faint)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
                title="Удалить датчик"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AddSensorModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />

      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative card !rounded-2xl shadow-xl p-5 max-w-sm w-full">
            <h3 className="font-semibold text-[var(--text-primary)] mb-1.5">Удалить датчик?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              «{sensors.find((s) => s.id === confirmDeleteId)?.name}» будет удалён из системы.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
