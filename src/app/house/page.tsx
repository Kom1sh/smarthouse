"use client";

import { useEffect, useState } from "react";
import { getHouseInfo } from "@/lib/api";
import { HouseInfo, EspDevice, Room } from "@/lib/types";
import {
  Home,
  MapPin,
  User,
  Clock,
  Wifi,
  WifiOff,
  Cpu,
  Layers,
  SquareStack,
  Activity,
  Signal,
  Server,
} from "lucide-react";
import { cn, formatUptime } from "@/lib/utils";

function RssiBar({ rssi }: { rssi: number }) {
  const strength = rssi > -60 ? 3 : rssi > -70 ? 2 : 1;
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3].map((level) => (
        <div
          key={level}
          className={cn(
            "w-1.5 rounded-sm",
            level === 1 ? "h-1.5" : level === 2 ? "h-2.5" : "h-4",
            strength >= level
              ? "bg-emerald-500"
              : "bg-slate-200 dark:bg-slate-700"
          )}
        />
      ))}
    </div>
  );
}

function EspCard({ device }: { device: EspDevice }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-4",
        device.status === "online"
          ? "border-slate-100 dark:border-slate-800"
          : "border-slate-200 dark:border-slate-700 opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "w-9 h-9 shrink-0 rounded-xl flex items-center justify-center",
              device.status === "online"
                ? "bg-cyan-50 dark:bg-cyan-950/50"
                : "bg-slate-100 dark:bg-slate-800"
            )}
          >
            <Server
              className={cn(
                "w-4 h-4",
                device.status === "online"
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-400 dark:text-slate-500"
              )}
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
              {device.name}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate">{device.ip}</p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap",
            device.status === "online"
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          )}
        >
          {device.status === "online" ? "Онлайн" : "Офлайн"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
          <Cpu className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate">{device.firmware}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
          <Activity className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate">{formatUptime(device.uptime)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Signal className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <RssiBar rssi={device.rssi} />
          <span>{device.rssi} дБм</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Cpu className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span>{device.sensors.length} датч.</span>
        </div>
      </div>
    </div>
  );
}

const roomIcons: Record<string, string> = {
  sofa: "🛋️",
  bed: "🛏️",
  utensils: "🍳",
  monitor: "🖥️",
  "door-open": "🚪",
  droplets: "🚿",
};

function RoomCard({ room }: { room: Room }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-lg">
          {roomIcons[room.icon] ?? "🏠"}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">{room.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Этаж {room.floor}</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <SquareStack className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{room.area} м²</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{room.sensors.length} датч.</span>
        </div>
      </div>
    </div>
  );
}

export default function HousePage() {
  const [house, setHouse] = useState<HouseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHouseInfo().then((data) => {
      setHouse(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!house) return null;

  const espOnline = house.espDevices.filter((e) => e.status === "online").length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-700 dark:to-cyan-700 rounded-2xl p-5 sm:p-6 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-5 h-5 opacity-80 shrink-0" />
              <h2 className="text-lg sm:text-xl font-bold truncate">{house.name}</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{house.address}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl sm:text-4xl font-bold">{house.area}</p>
            <p className="text-xs text-white/80 whitespace-nowrap">м² общая площадь</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { icon: User, label: "Владелец", value: house.owner },
            { icon: Layers, label: "Этажей", value: house.floors },
            { icon: Home, label: "Комнат", value: house.rooms.length },
            { icon: Clock, label: "Часовой пояс", value: house.timezone },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 opacity-80 shrink-0" />
                <span className="text-xs font-medium opacity-80 truncate">{label}</span>
              </div>
              <p className="font-semibold text-sm truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Помещения</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {house.rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">ESP-устройства</h2>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <Wifi className="w-4 h-4" />
              {espOnline} онлайн
            </span>
            {house.espDevices.length - espOnline > 0 && (
              <span className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                <WifiOff className="w-4 h-4" />
                {house.espDevices.length - espOnline} офлайн
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {house.espDevices.map((device) => (
            <EspCard key={device.id} device={device} />
          ))}
        </div>
      </div>
    </div>
  );
}
