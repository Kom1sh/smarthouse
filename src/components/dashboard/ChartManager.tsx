"use client";

import { useState, useEffect } from "react";
import { Plus, BarChart3, ChevronDown } from "lucide-react";
import { sensorStore } from "@/lib/sensorStore";
import { useSensors } from "@/lib/hooks";
import SensorChart from "./SensorChart";
import { cn } from "@/lib/utils";

const CHART_COLORS = [
  "#4f6ef7", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#6366f1",
];

interface ChartConfig {
  sensorId: string;
  hoursRange: number;
}

export default function ChartManager() {
  const sensors = useSensors();
  const numericSensors = sensors.filter((s) => typeof s.value === "number");
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [histories, setHistories] = useState<Record<string, { timestamp: string; value: number }[]>>({});
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (charts.length === 0 && numericSensors.length > 0) {
      setCharts(
        numericSensors.slice(0, 2).map((s) => ({ sensorId: s.id, hoursRange: 24 }))
      );
    }
  }, [numericSensors.length]);

  useEffect(() => {
    function sync() {
      const h: Record<string, { timestamp: string; value: number }[]> = {};
      for (const c of charts) {
        h[c.sensorId] = [...sensorStore.getHistory(c.sensorId)];
      }
      setHistories(h);
    }
    sync();
    return sensorStore.subscribe(sync);
  }, [charts]);

  const removeChart = (sensorId: string) => {
    setCharts((prev) => prev.filter((c) => c.sensorId !== sensorId));
  };

  const addChart = (sensorId: string) => {
    if (charts.find((c) => c.sensorId === sensorId)) return;
    setCharts((prev) => [...prev, { sensorId, hoursRange: 24 }]);
    setShowPicker(false);
  };

  const setRange = (sensorId: string, hours: number) => {
    setCharts((prev) =>
      prev.map((c) => (c.sensorId === sensorId ? { ...c, hoursRange: hours } : c))
    );
  };

  const availableToAdd = numericSensors.filter(
    (s) => !charts.find((c) => c.sensorId === s.id)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          Графики
        </h2>
        {availableToAdd.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowPicker((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить
              <ChevronDown className={cn("w-3 h-3 transition-transform", showPicker && "rotate-180")} />
            </button>

            {showPicker && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
                <div className="absolute right-0 top-8 z-20 card min-w-[240px] py-1 shadow-lg !rounded-lg overflow-hidden">
                  <p className="px-3 py-2 text-[11px] font-medium text-[var(--text-faint)] uppercase tracking-wider">
                    Выберите датчик
                  </p>
                  {availableToAdd.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => addChart(s.id)}
                      className="w-full text-left px-3 py-2.5 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-[11px] text-[var(--text-faint)] ml-2">
                        {s.room} · {s.unit}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {charts.length === 0 ? (
        <div className="card p-10 text-center">
          <BarChart3 className="w-8 h-8 text-[var(--text-faint)] mx-auto mb-3" />
          <p className="text-sm font-medium text-[var(--text-secondary)]">Нет активных графиков</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Добавьте график для мониторинга</p>
          {availableToAdd.length > 0 && (
            <button
              onClick={() => setShowPicker(true)}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[var(--accent)] rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить график
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {charts.map((c, i) => {
            const sensor = sensors.find((s) => s.id === c.sensorId);
            if (!sensor) return null;
            return (
              <SensorChart
                key={c.sensorId}
                sensorId={c.sensorId}
                sensorName={sensor.name}
                unit={sensor.unit}
                color={CHART_COLORS[i % CHART_COLORS.length]}
                history={histories[c.sensorId] ?? []}
                hoursRange={c.hoursRange}
                onRemove={() => removeChart(c.sensorId)}
                onRangeChange={(h) => setRange(c.sensorId, h)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
