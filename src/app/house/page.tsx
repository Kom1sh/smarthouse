"use client";

import { useState, useEffect } from "react";
import { useHouseInfo } from "@/lib/hooks";
import { houseStore } from "@/lib/houseStore";
import { EspDevice, Room } from "@/lib/types";
import {
  Home,
  MapPin,
  User,
  Clock,
  Wifi,
  WifiOff,
  Cpu,
  Layers,
  Activity,
  Signal,
  Server,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  ChevronDown,
} from "lucide-react";
import { cn, formatUptime } from "@/lib/utils";

function RssiBar({ rssi }: { rssi: number }) {
  const strength = rssi > -60 ? 3 : rssi > -70 ? 2 : 1;
  return (
    <div className="flex items-end gap-0.5 h-3.5">
      {[1, 2, 3].map((level) => (
        <div
          key={level}
          className={cn(
            "w-1.5 rounded-sm",
            level === 1 ? "h-1.5" : level === 2 ? "h-2.5" : "h-3.5",
            strength >= level
              ? "bg-emerald-500"
              : "bg-neutral-200 dark:bg-neutral-700"
          )}
        />
      ))}
    </div>
  );
}

const roomIcons: Record<string, string> = {
  sofa: "🛋️", bed: "🛏️", utensils: "🍳", monitor: "🖥️",
  "door-open": "🚪", droplets: "🚿",
};

const iconOptions = [
  { value: "sofa", label: "🛋️ Гостиная" },
  { value: "bed", label: "🛏️ Спальня" },
  { value: "utensils", label: "🍳 Кухня" },
  { value: "monitor", label: "🖥️ Кабинет" },
  { value: "door-open", label: "🚪 Прихожая" },
  { value: "droplets", label: "🚿 Ванная" },
];

function InputField({ label, value, onChange, type = "text", placeholder, mono, className: cls }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; placeholder?: string; mono?: boolean; className?: string;
}) {
  return (
    <div className={cls}>
      <label className="block text-xs text-[var(--text-tertiary)] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full px-3 py-2 bg-[var(--surface)] border border-[var(--card-border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 focus:border-[var(--accent)]",
          mono && "font-mono"
        )}
      />
    </div>
  );
}

function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-lg max-h-[85vh] overflow-y-auto !rounded-2xl shadow-xl">
        <div className="sticky top-0 bg-[var(--card)] flex items-center justify-between px-5 py-4 border-b border-[var(--card-border)] rounded-t-2xl z-10">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EditHouseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const house = useHouseInfo();
  const [name, setName] = useState(house.name);
  const [address, setAddress] = useState(house.address);
  const [area, setArea] = useState(String(house.area));
  const [floors, setFloors] = useState(String(house.floors));
  const [owner, setOwner] = useState(house.owner);
  const [timezone, setTimezone] = useState(house.timezone);

  useEffect(() => {
    if (open) {
      setName(house.name); setAddress(house.address);
      setArea(String(house.area)); setFloors(String(house.floors));
      setOwner(house.owner); setTimezone(house.timezone);
    }
  }, [open]);

  const handleSave = () => {
    houseStore.updateInfo({
      name, address,
      area: parseFloat(area) || house.area,
      floors: parseInt(floors) || house.floors,
      owner, timezone,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Редактировать дом">
      <div className="p-5 space-y-3">
        <InputField label="Название" value={name} onChange={setName} placeholder="Мой умный дом" />
        <InputField label="Адрес" value={address} onChange={setAddress} placeholder="г. Москва..." />
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Площадь (м²)" value={area} onChange={setArea} type="number" />
          <InputField label="Этажей" value={floors} onChange={setFloors} type="number" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Владелец" value={owner} onChange={setOwner} />
          <InputField label="Часовой пояс" value={timezone} onChange={setTimezone} />
        </div>
      </div>
      <div className="sticky bottom-0 bg-[var(--card)] px-5 py-3 border-t border-[var(--card-border)] flex gap-2 rounded-b-2xl">
        <button onClick={onClose} className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-colors">
          Отмена
        </button>
        <button onClick={handleSave} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 transition-opacity">
          Сохранить
        </button>
      </div>
    </Modal>
  );
}

function RoomModal({ open, onClose, editRoom }: { open: boolean; onClose: () => void; editRoom?: Room }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("sofa");
  const [area, setArea] = useState("");
  const [floor, setFloor] = useState("1");

  useEffect(() => {
    if (open) {
      if (editRoom) {
        setName(editRoom.name); setIcon(editRoom.icon);
        setArea(String(editRoom.area)); setFloor(String(editRoom.floor));
      } else {
        setName(""); setIcon("sofa"); setArea(""); setFloor("1");
      }
    }
  }, [open, editRoom]);

  const handleSave = () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      icon,
      area: parseFloat(area) || 0,
      floor: parseInt(floor) || 1,
      sensors: editRoom?.sensors ?? [],
    };
    if (editRoom) {
      houseStore.updateRoom(editRoom.id, payload);
    } else {
      houseStore.addRoom(payload);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editRoom ? "Редактировать комнату" : "Добавить комнату"}>
      <div className="p-5 space-y-3">
        <InputField label="Название *" value={name} onChange={setName} placeholder="Гостиная" />
        <div>
          <label className="block text-xs text-[var(--text-tertiary)] mb-1.5">Иконка</label>
          <div className="flex gap-1.5 flex-wrap">
            {iconOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setIcon(opt.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs transition-all",
                  icon === opt.value
                    ? "bg-[var(--accent)] text-white font-medium"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)]"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Площадь (м²)" value={area} onChange={setArea} type="number" placeholder="22" />
          <InputField label="Этаж" value={floor} onChange={setFloor} type="number" placeholder="1" />
        </div>
      </div>
      <div className="sticky bottom-0 bg-[var(--card)] px-5 py-3 border-t border-[var(--card-border)] flex gap-2 rounded-b-2xl">
        <button onClick={onClose} className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-colors">
          Отмена
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className={cn(
            "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-opacity",
            name.trim() ? "bg-[var(--accent)] text-white hover:opacity-90" : "bg-[var(--surface)] text-[var(--text-faint)] cursor-not-allowed"
          )}
        >
          {editRoom ? "Сохранить" : "Добавить"}
        </button>
      </div>
    </Modal>
  );
}

function EspModal({ open, onClose, editDevice }: { open: boolean; onClose: () => void; editDevice?: EspDevice }) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("192.168.1.");
  const [firmware, setFirmware] = useState("v2.3.1");

  useEffect(() => {
    if (open) {
      if (editDevice) {
        setName(editDevice.name); setIp(editDevice.ip); setFirmware(editDevice.firmware);
      } else {
        setName(""); setIp("192.168.1."); setFirmware("v2.3.1");
      }
    }
  }, [open, editDevice]);

  const handleSave = () => {
    if (!name.trim() || !ip.trim()) return;
    const payload = {
      name: name.trim(),
      ip: ip.trim(),
      firmware,
      status: editDevice?.status ?? ("online" as const),
      lastSeen: editDevice?.lastSeen ?? new Date().toISOString(),
      sensors: editDevice?.sensors ?? [],
      rssi: editDevice?.rssi ?? -60,
      uptime: editDevice?.uptime ?? 0,
    };
    if (editDevice) {
      houseStore.updateEspDevice(editDevice.id, payload);
    } else {
      houseStore.addEspDevice(payload);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editDevice ? "Редактировать ESP" : "Добавить ESP"}>
      <div className="p-5 space-y-3">
        <InputField label="Имя устройства *" value={name} onChange={setName} placeholder="ESP-Living" />
        <InputField label="IP-адрес *" value={ip} onChange={setIp} placeholder="192.168.1.101" mono />
        <InputField label="Прошивка" value={firmware} onChange={setFirmware} placeholder="v2.3.1" />
      </div>
      <div className="sticky bottom-0 bg-[var(--card)] px-5 py-3 border-t border-[var(--card-border)] flex gap-2 rounded-b-2xl">
        <button onClick={onClose} className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-colors">
          Отмена
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || !ip.trim()}
          className={cn(
            "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-opacity",
            name.trim() && ip.trim() ? "bg-[var(--accent)] text-white hover:opacity-90" : "bg-[var(--surface)] text-[var(--text-faint)] cursor-not-allowed"
          )}
        >
          {editDevice ? "Сохранить" : "Добавить"}
        </button>
      </div>
    </Modal>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, message }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card !rounded-2xl shadow-xl p-5 max-w-sm w-full">
        <h3 className="font-semibold text-[var(--text-primary)] mb-1.5">{title}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5">{message}</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-3 py-2 rounded-lg text-sm bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--card-hover)] transition-colors">
            Отмена
          </button>
          <button onClick={onConfirm} className="flex-1 px-3 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HousePage() {
  const house = useHouseInfo();
  const [mounted, setMounted] = useState(false);

  const [editHouseOpen, setEditHouseOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | undefined>(undefined);
  const [espModalOpen, setEspModalOpen] = useState(false);
  const [editEsp, setEditEsp] = useState<EspDevice | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "room" | "esp"; id: string; name: string } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-[var(--card-border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  const espOnline = house.espDevices.filter((e) => e.status === "online").length;

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "room") houseStore.removeRoom(deleteTarget.id);
    else houseStore.removeEspDevice(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* House info card */}
      <div className="card p-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent)] to-cyan-500 rounded-t-[14px]" />

        <div className="flex items-start justify-between gap-4 mb-4 pt-1">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--text-primary)] truncate">{house.name}</h2>
            <div className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] mt-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[var(--text-tertiary)]" />
              <span className="truncate">{house.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right mr-2">
              <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{house.area}</p>
              <p className="text-xs text-[var(--text-faint)]">м²</p>
            </div>
            <button
              onClick={() => setEditHouseOpen(true)}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
              title="Редактировать"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: User, label: "Владелец", value: house.owner },
            { icon: Layers, label: "Этажей", value: house.floors },
            { icon: Home, label: "Комнат", value: house.rooms.length },
            { icon: Clock, label: "Часовой пояс", value: house.timezone },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[var(--surface)] rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-[var(--text-faint)]" />
                <span className="text-[11px] text-[var(--text-faint)] uppercase tracking-wider font-medium">{label}</span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Rooms */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Помещения ({house.rooms.length})
          </h2>
          <button
            onClick={() => { setEditRoom(undefined); setRoomModalOpen(true); }}
            className="flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить
          </button>
        </div>

        {house.rooms.length === 0 ? (
          <div className="card p-10 text-center">
            <Home className="w-8 h-8 text-[var(--text-faint)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">Нет помещений</p>
            <button
              onClick={() => { setEditRoom(undefined); setRoomModalOpen(true); }}
              className="mt-3 text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Добавить первую комнату
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {house.rooms.map((room) => (
              <div key={room.id} className="card card-interactive p-4 group relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{roomIcons[room.icon] ?? "🏠"}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{room.name}</p>
                    <p className="text-xs text-[var(--text-faint)]">Этаж {room.floor}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                  <span>{room.area} м²</span>
                  <span>{room.sensors.length} датч.</span>
                </div>
                <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditRoom(room); setRoomModalOpen(true); }}
                    className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: "room", id: room.id, name: room.name })}
                    className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ESP Devices */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-[13px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              ESP-устройства ({house.espDevices.length})
            </h2>
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
              {espOnline} онлайн
            </span>
          </div>
          <button
            onClick={() => { setEditEsp(undefined); setEspModalOpen(true); }}
            className="flex items-center gap-1 text-xs font-medium text-[var(--accent)] hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            Добавить
          </button>
        </div>

        {house.espDevices.length === 0 ? (
          <div className="card p-10 text-center">
            <Server className="w-8 h-8 text-[var(--text-faint)] mx-auto mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">Нет устройств</p>
            <button
              onClick={() => { setEditEsp(undefined); setEspModalOpen(true); }}
              className="mt-3 text-xs font-medium text-[var(--accent)] hover:underline"
            >
              Добавить первое устройство
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {house.espDevices.map((device) => (
              <div
                key={device.id}
                className={cn(
                  "card card-interactive p-4 group relative",
                  device.status === "offline" && "opacity-50"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-9 h-9 shrink-0 rounded-xl flex items-center justify-center",
                      device.status === "online"
                        ? "bg-cyan-50 dark:bg-cyan-950/40"
                        : "bg-[var(--surface)]"
                    )}>
                      <Server className={cn(
                        "w-4 h-4",
                        device.status === "online"
                          ? "text-cyan-600 dark:text-cyan-400"
                          : "text-[var(--text-faint)]"
                      )} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{device.name}</p>
                      <p className="text-xs text-[var(--text-faint)] font-mono truncate">{device.ip}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium",
                    device.status === "online"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-[var(--surface)] text-[var(--text-faint)]"
                  )}>
                    {device.status === "online" ? "Онлайн" : "Офлайн"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-[var(--text-tertiary)]">
                  <div className="flex items-center gap-1.5 truncate">
                    <Cpu className="w-3 h-3 shrink-0 text-[var(--text-faint)]" />
                    <span className="truncate">{device.firmware}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Activity className="w-3 h-3 shrink-0 text-[var(--text-faint)]" />
                    <span className="truncate">{formatUptime(device.uptime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Signal className="w-3 h-3 shrink-0 text-[var(--text-faint)]" />
                    <RssiBar rssi={device.rssi} />
                    <span>{device.rssi} дБм</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 shrink-0 text-[var(--text-faint)]" />
                    <span>{device.sensors.length} датч.</span>
                  </div>
                </div>

                <div className="absolute top-2 right-10 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditEsp(device); setEspModalOpen(true); }}
                    className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: "esp", id: device.id, name: device.name })}
                    className="p-1.5 rounded-md text-[var(--text-faint)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EditHouseModal open={editHouseOpen} onClose={() => setEditHouseOpen(false)} />
      <RoomModal open={roomModalOpen} onClose={() => setRoomModalOpen(false)} editRoom={editRoom} />
      <EspModal open={espModalOpen} onClose={() => setEspModalOpen(false)} editDevice={editEsp} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget?.type === "room" ? "Удалить комнату?" : "Удалить устройство?"}
        message={`«${deleteTarget?.name}» будет удалён из системы. Это действие нельзя отменить.`}
      />
    </div>
  );
}
