"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SensorType } from "@/lib/types";
import { sensorTypeLabels } from "@/lib/utils";
import { sensorStore } from "@/lib/sensorStore";

const sensorTypes: SensorType[] = [
  "temperature", "humidity", "pressure", "motion",
  "smoke", "co2", "light", "water_leak", "door", "window",
];

const defaultUnits: Record<SensorType, string> = {
  temperature: "°C", humidity: "%", pressure: "кПа", motion: "",
  smoke: "", co2: "ppm", light: "lx", water_leak: "", door: "", window: "",
};

interface AddSensorModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddSensorModal({ open, onClose }: AddSensorModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<SensorType>("temperature");
  const [room, setRoom] = useState("");
  const [espIp, setEspIp] = useState("192.168.1.");
  const [espName, setEspName] = useState("");
  const [unit, setUnit] = useState("°C");
  const [minThreshold, setMinThreshold] = useState("");
  const [maxThreshold, setMaxThreshold] = useState("");

  const isBool = ["motion", "smoke", "water_leak", "door", "window"].includes(type);

  const handleTypeChange = (newType: SensorType) => {
    setType(newType);
    setUnit(defaultUnits[newType]);
  };

  const handleSubmit = () => {
    if (!name.trim() || !room.trim() || !espIp.trim() || !espName.trim()) return;
    sensorStore.addSensor({
      name: name.trim(), type, room: room.trim(),
      espIp: espIp.trim(), espName: espName.trim(), unit,
      minThreshold: minThreshold ? parseFloat(minThreshold) : undefined,
      maxThreshold: maxThreshold ? parseFloat(maxThreshold) : undefined,
    });
    setName(""); setRoom(""); setEspIp("192.168.1."); setEspName("");
    setType("temperature"); setUnit("°C"); setMinThreshold(""); setMaxThreshold("");
    onClose();
  };

  const canSubmit = name.trim() && room.trim() && espIp.trim() && espName.trim();

  if (!open) return null;

  const inputCls = "w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--card-border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-lg max-h-[90vh] overflow-y-auto !rounded-2xl shadow-xl">
        <div className="sticky top-0 bg-[var(--card)] flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)] rounded-t-2xl z-10">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Добавить датчик</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Название *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="DHT11 Температура" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-tertiary)] mb-2">Тип датчика</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {sensorTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    "px-2 py-2 rounded-lg text-xs transition-all",
                    type === t
                      ? "bg-[var(--accent)] text-white font-medium"
                      : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {sensorTypeLabels[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Комната *</label>
              <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Гостиная" className={inputCls} />
            </div>
            {!isBool && (
              <div>
                <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Единица</label>
                <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="°C" className={inputCls} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">IP ESP *</label>
              <input type="text" value={espIp} onChange={(e) => setEspIp(e.target.value)} placeholder="192.168.1.101" className={cn(inputCls, "font-mono")} />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Имя ESP *</label>
              <input type="text" value={espName} onChange={(e) => setEspName(e.target.value)} placeholder="ESP32-Living" className={inputCls} />
            </div>
          </div>

          {!isBool && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Мин. порог</label>
                <input type="number" value={minThreshold} onChange={(e) => setMinThreshold(e.target.value)} placeholder="18" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Макс. порог</label>
                <input type="number" value={maxThreshold} onChange={(e) => setMaxThreshold(e.target.value)} placeholder="28" className={inputCls} />
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[var(--card)] px-5 py-3 border-t border-[var(--card-border)] flex gap-2 rounded-b-2xl">
          <button onClick={onClose} className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-colors">
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              canSubmit ? "bg-[var(--accent)] text-white hover:opacity-90" : "bg-[var(--surface)] text-[var(--text-faint)] cursor-not-allowed"
            )}
          >
            Добавить
          </button>
        </div>
      </div>
    </div>
  );
}
