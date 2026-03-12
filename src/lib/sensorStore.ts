import { Sensor, Notification, SensorType } from "./types";
import { subMinutes, format } from "date-fns";

type Listener = () => void;

function dht11Temp(): number {
  const hour = new Date().getHours();
  const base = hour >= 22 || hour < 7 ? 23.5 : hour >= 10 && hour < 15 ? 25.8 : 25.0;
  return Math.round((base + (Math.random() - 0.5) * 0.8) * 10) / 10;
}

function dht11Humidity(): number {
  const hour = new Date().getHours();
  const base = hour >= 22 || hour < 7 ? 48 : hour >= 10 && hour < 15 ? 42 : 45;
  return Math.round(base + (Math.random() - 0.5) * 4);
}

function generateRealisticHistory(
  baseValue: number,
  hoursBack: number,
  variance: number,
  dayPattern?: (hour: number) => number
): { timestamp: string; value: number }[] {
  const readings: { timestamp: string; value: number }[] = [];
  const now = new Date();
  const pointsPerHour = 4;
  const total = hoursBack * pointsPerHour;

  for (let i = total; i >= 0; i--) {
    const time = subMinutes(now, i * (60 / pointsPerHour));
    const h = time.getHours();
    const base = dayPattern ? dayPattern(h) : baseValue;
    const noise = (Math.random() - 0.5) * variance;
    readings.push({
      timestamp: format(time, "HH:mm"),
      value: Math.round((base + noise) * 10) / 10,
    });
  }
  return readings;
}

function makeDefaultSensors(): Sensor[] {
  return [
    {
      id: "dht11-temp",
      name: "DHT11 Температура",
      type: "temperature",
      room: "Гостиная",
      espIp: "192.168.1.101",
      espName: "ESP32-Living",
      value: dht11Temp(),
      unit: "°C",
      status: "online",
      lastUpdated: new Date().toISOString(),
      minThreshold: 18,
      maxThreshold: 28,
    },
    {
      id: "dht11-humid",
      name: "DHT11 Влажность",
      type: "humidity",
      room: "Гостиная",
      espIp: "192.168.1.101",
      espName: "ESP32-Living",
      value: dht11Humidity(),
      unit: "%",
      status: "online",
      lastUpdated: new Date().toISOString(),
      minThreshold: 30,
      maxThreshold: 70,
    },
  ];
}

function makeDefaultNotifications(): Notification[] {
  return [
    {
      id: "n-welcome",
      title: "Система запущена",
      message: "Все датчики DHT11 в гостиной подключены и передают данные. Показатели в норме.",
      severity: "info",
      room: "Гостиная",
      timestamp: subMinutes(new Date(), 5).toISOString(),
      read: false,
    },
  ];
}

function makeDefaultHistories(): Record<string, { timestamp: string; value: number }[]> {
  return {
    "dht11-temp": generateRealisticHistory(
      25, 24, 0.6,
      (h) => (h >= 22 || h < 7 ? 23.5 : h >= 10 && h < 15 ? 25.8 : 25.0)
    ),
    "dht11-humid": generateRealisticHistory(
      45, 24, 3,
      (h) => (h >= 22 || h < 7 ? 48 : h >= 10 && h < 15 ? 42 : 45)
    ),
  };
}

class SensorStore {
  private sensors: Sensor[];
  private notifications: Notification[];
  private histories: Record<string, { timestamp: string; value: number }[]>;
  private listeners: Set<Listener> = new Set();
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private nextSensorNum = 1;
  private nextNotifNum = 10;

  private _sensorsSnapshot: Sensor[] = [];
  private _notificationsSnapshot: Notification[] = [];
  private _unreadCountSnapshot: number = 0;
  private _version = 0;

  constructor() {
    this.sensors = makeDefaultSensors();
    this.notifications = makeDefaultNotifications();
    this.histories = makeDefaultHistories();
    this.rebuildSnapshots();
    this.startTick();
  }

  private rebuildSnapshots() {
    this._sensorsSnapshot = [...this.sensors];
    this._notificationsSnapshot = [...this.notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    this._unreadCountSnapshot = this.notifications.filter((n) => !n.read).length;
    this._version++;
  }

  private startTick() {
    if (this.tickInterval) return;
    this.tickInterval = setInterval(() => this.tick(), 5000);
  }

  private tick() {
    let changed = false;
    for (const s of this.sensors) {
      if (s.status === "offline") continue;

      if (s.type === "temperature" && s.id.startsWith("dht11")) {
        s.value = dht11Temp();
        s.lastUpdated = new Date().toISOString();
        this.appendHistory(s.id, s.value as number);
        changed = true;
      } else if (s.type === "humidity" && s.id.startsWith("dht11")) {
        s.value = dht11Humidity();
        s.lastUpdated = new Date().toISOString();
        this.appendHistory(s.id, s.value as number);
        changed = true;
      } else if (typeof s.value === "number") {
        const variance = (s.maxThreshold && s.minThreshold)
          ? (s.maxThreshold - s.minThreshold) * 0.02
          : Math.abs(s.value as number) * 0.005;
        s.value = Math.round(((s.value as number) + (Math.random() - 0.5) * variance) * 10) / 10;
        s.lastUpdated = new Date().toISOString();
        this.appendHistory(s.id, s.value as number);
        changed = true;
      }

      if (typeof s.value === "number" && s.maxThreshold && s.value > s.maxThreshold) {
        s.status = "warning";
      } else if (typeof s.value === "number" && s.minThreshold && s.value < s.minThreshold) {
        s.status = "warning";
      } else if (s.status === "warning" && typeof s.value === "number") {
        if (
          (!s.maxThreshold || s.value <= s.maxThreshold) &&
          (!s.minThreshold || s.value >= s.minThreshold)
        ) {
          s.status = "online";
        }
      }
    }
    if (changed) this.emit();
  }

  private appendHistory(sensorId: string, value: number) {
    if (!this.histories[sensorId]) {
      this.histories[sensorId] = [];
    }
    this.histories[sensorId].push({
      timestamp: format(new Date(), "HH:mm"),
      value,
    });
    if (this.histories[sensorId].length > 200) {
      this.histories[sensorId] = this.histories[sensorId].slice(-200);
    }
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit() {
    this.rebuildSnapshots();
    this.listeners.forEach((fn) => fn());
  }

  getSensors(): Sensor[] {
    return this._sensorsSnapshot;
  }

  getNotifications(): Notification[] {
    return this._notificationsSnapshot;
  }

  getHistory(sensorId: string): { timestamp: string; value: number }[] {
    return this.histories[sensorId] ?? [];
  }

  getUnreadCount(): number {
    return this._unreadCountSnapshot;
  }

  getVersion(): number {
    return this._version;
  }

  markNotificationRead(id: string) {
    const n = this.notifications.find((x) => x.id === id);
    if (n) n.read = true;
    this.emit();
  }

  markAllNotificationsRead() {
    this.notifications.forEach((n) => (n.read = true));
    this.emit();
  }

  addSensor(data: {
    name: string;
    type: SensorType;
    room: string;
    espIp: string;
    espName: string;
    unit: string;
    minThreshold?: number;
    maxThreshold?: number;
  }): Sensor {
    const id = `sensor-${Date.now()}-${this.nextSensorNum++}`;

    const isBool = ["motion", "smoke", "water_leak", "door", "window"].includes(data.type);
    const defaultValues: Record<string, number> = {
      temperature: 22.0,
      humidity: 45,
      pressure: 101.3,
      co2: 450,
      light: 300,
    };

    const sensor: Sensor = {
      id,
      name: data.name,
      type: data.type,
      room: data.room,
      espIp: data.espIp,
      espName: data.espName,
      value: isBool ? false : (defaultValues[data.type] ?? 0),
      unit: data.unit,
      status: "online",
      lastUpdated: new Date().toISOString(),
      minThreshold: data.minThreshold,
      maxThreshold: data.maxThreshold,
    };

    this.sensors.push(sensor);

    if (!isBool) {
      this.histories[id] = generateRealisticHistory(
        sensor.value as number, 24,
        (sensor.maxThreshold && sensor.minThreshold)
          ? (sensor.maxThreshold - sensor.minThreshold) * 0.05
          : 1
      );
    }

    this.notifications.unshift({
      id: `n-add-${this.nextNotifNum++}`,
      title: "Датчик добавлен",
      message: `Датчик «${data.name}» (${data.type}) подключён в комнате «${data.room}» через ${data.espName}.`,
      severity: "info",
      sensorId: id,
      sensorName: data.name,
      room: data.room,
      timestamp: new Date().toISOString(),
      read: false,
    });

    this.emit();
    return sensor;
  }

  removeSensor(id: string) {
    const sensor = this.sensors.find((s) => s.id === id);
    if (!sensor) return;
    this.sensors = this.sensors.filter((s) => s.id !== id);
    delete this.histories[id];

    this.notifications.unshift({
      id: `n-rm-${this.nextNotifNum++}`,
      title: "Датчик удалён",
      message: `Датчик «${sensor.name}» был удалён из системы.`,
      severity: "warning",
      sensorId: id,
      sensorName: sensor.name,
      room: sensor.room,
      timestamp: new Date().toISOString(),
      read: false,
    });

    this.emit();
  }
}

export const sensorStore = new SensorStore();
