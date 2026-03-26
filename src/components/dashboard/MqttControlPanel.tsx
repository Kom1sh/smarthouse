"use client";

import { Activity, AlertTriangle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useHttpPollingState } from "@/lib/hooks";
import { sensorStore } from "@/lib/sensorStore";
import { cn, formatTimestamp } from "@/lib/utils";

const statusLabels = {
  idle: "Ожидание",
  connecting: "Первый запрос",
  connected: "Данные приходят",
  polling: "Идёт опрос",
  offline: "Нет связи",
  error: "Ошибка",
} as const;

export default function MqttControlPanel() {
  const polling = useHttpPollingState();

  const statusColor =
    polling.status === "connected"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : polling.status === "connecting" || polling.status === "polling"
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            HTTP / ESP32 polling
          </h2>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Фронтенд напрямую опрашивает <code className="text-xs">{polling.sensorsEndpoint}</code> на ESP32 и обновляет интерфейс без MQTT.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium shrink-0",
            statusColor
          )}
        >
          {polling.status === "connected" ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {statusLabels[polling.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-[var(--surface)] border border-[var(--card-border)] p-3 space-y-2">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
            <Activity className="w-4 h-4 text-[var(--accent)]" />
            Источник данных
          </div>
          <p className="text-xs text-[var(--text-tertiary)] break-all">{polling.baseUrl}</p>
          <p className="text-xs text-[var(--text-tertiary)] break-all">Endpoint: {polling.sensorsUrl}</p>
          <p className="text-xs text-[var(--text-faint)]">Интервал опроса: {polling.pollIntervalMs} мс</p>
        </div>

        <div className="rounded-xl bg-[var(--surface)] border border-[var(--card-border)] p-3 space-y-2">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] font-medium">
            <RefreshCw className="w-4 h-4 text-[var(--accent)]" />
            Последние обращения
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Последний fetch: {polling.lastFetchAt ? formatTimestamp(polling.lastFetchAt) : "ещё не было"}
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Последний успешный ответ: {polling.lastSuccessAt ? formatTimestamp(polling.lastSuccessAt) : "ещё не было"}
          </p>
          <p className="text-xs text-[var(--text-faint)]">
            Источник данных: {polling.usingLiveData ? "живой JSON с ESP32" : "ожидание первого ответа"}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => void sensorStore.refreshNow()}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          Обновить сейчас
        </button>
      </div>

      {polling.lastError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 p-3 text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{polling.lastError}</span>
        </div>
      )}
    </div>
  );
}
