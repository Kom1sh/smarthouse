import {
  Sensor,
  Notification,
  SensorType,
  HttpPollingStateSnapshot,
  SensorStatus,
} from "./types";
import { format } from "date-fns";

type Listener = () => void;

type EspHttpPayload = {
  gas?: unknown;
  water?: unknown;
  vibro?: unknown;
  light?: unknown;
  temp?: unknown;
  hum?: unknown;
};

const DEFAULT_ESP32_BASE_URL =
  process.env.NEXT_PUBLIC_ESP32_BASE_URL ?? "http://192.168.0.50";
const DEFAULT_ESP32_SENSORS_PATH =
  process.env.NEXT_PUBLIC_ESP32_SENSORS_PATH ?? "/sensors";
const DEFAULT_POLL_INTERVAL_MS = normalizePollInterval(
  process.env.NEXT_PUBLIC_ESP32_POLL_INTERVAL_MS
);
const HTTP_SENSOR_IDS = [
  "esp32-temp",
  "esp32-hum",
  "esp32-gas",
  "esp32-water",
  "esp32-vibro",
  "esp32-light",
] as const;

function normalizePollInterval(value: string | undefined) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 3_000;
  return Math.min(60_000, Math.max(1_000, Math.round(parsed)));
}

function nowIso() {
  return new Date().toISOString();
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function numericStatus(value: number, min?: number, max?: number): SensorStatus {
  if (max !== undefined && value > max) {
    const hardMax = max * 1.25;
    return value >= hardMax ? "critical" : "warning";
  }
  if (min !== undefined && value < min) {
    const hardMin = min * 0.75;
    return value <= hardMin ? "critical" : "warning";
  }
  return "online";
}

function waterStatus(value: number): SensorStatus {
  if (value >= 1800) return "critical";
  if (value >= 1000) return "warning";
  return "online";
}

async function fetchJsonWithTimeout<T>(url: string, timeoutMs = 4_500): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`ESP32 ответил кодом ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function getFriendlyFetchError(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "ESP32 не ответил вовремя. Проверьте питание устройства и локальную сеть.";
  }

  if (error instanceof Error) {
    if (error.message.includes("Failed to fetch")) {
      return "Браузер не смог достучаться до ESP32. Обычно это IP/порт, CORS или mixed content (HTTPS → HTTP).";
    }
    return error.message;
  }

  return "Не удалось получить данные от ESP32.";
}

function extractHostLabel(baseUrl: string) {
  try {
    return new URL(baseUrl).host;
  } catch {
    return baseUrl;
  }
}

function buildSensorsUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function makeDefaultSensors(baseUrl: string): Sensor[] {
  const timestamp = nowIso();
  const hostLabel = extractHostLabel(baseUrl);

  return [
    {
      id: "esp32-temp",
      name: "Температура DHT",
      type: "temperature",
      room: "Гостиная",
      espIp: hostLabel,
      espName: "ESP32 HTTP",
      value: 0,
      unit: "°C",
      status: "offline",
      lastUpdated: timestamp,
      minThreshold: 18,
      maxThreshold: 28,
    },
    {
      id: "esp32-hum",
      name: "Влажность DHT",
      type: "humidity",
      room: "Гостиная",
      espIp: hostLabel,
      espName: "ESP32 HTTP",
      value: 0,
      unit: "%",
      status: "offline",
      lastUpdated: timestamp,
      minThreshold: 30,
      maxThreshold: 70,
    },
    {
      id: "esp32-gas",
      name: "Газ (raw)",
      type: "co2",
      room: "Гостиная",
      espIp: hostLabel,
      espName: "ESP32 HTTP",
      value: 0,
      unit: "raw",
      status: "offline",
      lastUpdated: timestamp,
      maxThreshold: 2500,
    },
    {
      id: "esp32-water",
      name: "Вода (raw)",
      type: "water_leak",
      room: "Гостиная",
      espIp: hostLabel,
      espName: "ESP32 HTTP",
      value: 0,
      unit: "raw",
      status: "offline",
      lastUpdated: timestamp,
      maxThreshold: 1000,
    },
    {
      id: "esp32-vibro",
      name: "Вибрация",
      type: "motion",
      room: "Гостиная",
      espIp: hostLabel,
      espName: "ESP32 HTTP",
      value: false,
      unit: "",
      status: "offline",
      lastUpdated: timestamp,
    },
    {
      id: "esp32-light",
      name: "Освещённость",
      type: "light",
      room: "Гостиная",
      espIp: hostLabel,
      espName: "ESP32 HTTP",
      value: false,
      unit: "",
      status: "offline",
      lastUpdated: timestamp,
    },
  ];
}

function makeDefaultNotifications(baseUrl: string, endpoint: string): Notification[] {
  return [
    {
      id: "n-welcome",
      title: "HTTP polling ожидает данные",
      message: `Фронтенд опрашивает ${buildSensorsUrl(baseUrl, endpoint)} и обновит карточки, как только ESP32 начнёт отдавать JSON.`,
      severity: "info",
      room: "Гостиная",
      timestamp: nowIso(),
      read: false,
    },
  ];
}

function makeDefaultHistories(): Record<string, { timestamp: string; value: number }[]> {
  return {
    "esp32-temp": [],
    "esp32-hum": [],
    "esp32-gas": [],
    "esp32-water": [],
  };
}

class SensorStore {
  private sensors: Sensor[];
  private notifications: Notification[];
  private histories: Record<string, { timestamp: string; value: number }[]>;
  private listeners: Set<Listener> = new Set();
  private staleInterval: number | null = null;
  private pollingInterval: number | null = null;
  private pollingStarted = false;
  private pollInFlight = false;
  private nextSensorNum = 1;
  private nextNotifNum = 10;
  private notificationCooldowns = new Map<string, number>();

  private pollingState: HttpPollingStateSnapshot = {
    status: "idle",
    baseUrl: DEFAULT_ESP32_BASE_URL,
    sensorsEndpoint: DEFAULT_ESP32_SENSORS_PATH,
    sensorsUrl: buildSensorsUrl(DEFAULT_ESP32_BASE_URL, DEFAULT_ESP32_SENSORS_PATH),
    pollIntervalMs: DEFAULT_POLL_INTERVAL_MS,
    lastFetchAt: null,
    lastSuccessAt: null,
    lastError: null,
    usingLiveData: false,
  };

  private _sensorsSnapshot: Sensor[] = [];
  private _notificationsSnapshot: Notification[] = [];
  private _unreadCountSnapshot = 0;

  constructor() {
    this.sensors = makeDefaultSensors(DEFAULT_ESP32_BASE_URL);
    this.notifications = makeDefaultNotifications(
      DEFAULT_ESP32_BASE_URL,
      DEFAULT_ESP32_SENSORS_PATH
    );
    this.histories = makeDefaultHistories();
    this.rebuildSnapshots();
  }

  private rebuildSnapshots() {
    this._sensorsSnapshot = [...this.sensors];
    this._notificationsSnapshot = [...this.notifications].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    this._unreadCountSnapshot = this.notifications.filter((n) => !n.read).length;
  }

  private emit() {
    this.rebuildSnapshots();
    this.listeners.forEach((fn) => fn());
  }

  private setPollingState(
    patch: Partial<HttpPollingStateSnapshot>,
    shouldEmit = true
  ) {
    this.pollingState = { ...this.pollingState, ...patch };
    if (shouldEmit) this.emit();
  }

  private getSensorById(id: string) {
    return this.sensors.find((sensor) => sensor.id === id);
  }

  private updateSensor(id: string, patch: Partial<Sensor>) {
    const sensor = this.getSensorById(id);
    if (!sensor) return;
    Object.assign(sensor, patch);
  }

  private appendHistory(sensorId: string, value: number) {
    if (!this.histories[sensorId]) {
      this.histories[sensorId] = [];
    }
    this.histories[sensorId].push({
      timestamp: format(new Date(), "HH:mm:ss"),
      value,
    });
    if (this.histories[sensorId].length > 200) {
      this.histories[sensorId] = this.histories[sensorId].slice(-200);
    }
  }

  private shouldNotify(key: string, cooldownMs = 60_000) {
    const now = Date.now();
    const last = this.notificationCooldowns.get(key) ?? 0;
    if (now - last < cooldownMs) return false;
    this.notificationCooldowns.set(key, now);
    return true;
  }

  private pushNotification(notification: Omit<Notification, "id" | "timestamp" | "read">) {
    this.notifications.unshift({
      id: `n-${this.nextNotifNum++}`,
      timestamp: nowIso(),
      read: false,
      ...notification,
    });
  }

  private markCoreSensorsOffline() {
    let changed = false;
    for (const sensorId of HTTP_SENSOR_IDS) {
      const sensor = this.getSensorById(sensorId);
      if (sensor && sensor.status !== "offline") {
        sensor.status = "offline";
        changed = true;
      }
    }
    return changed;
  }

  private updateFromPayload(payload: EspHttpPayload) {
    const timestamp = nowIso();
    const temp = parseNumber(payload.temp);
    const hum = parseNumber(payload.hum);
    const gas = parseNumber(payload.gas);
    const water = parseNumber(payload.water);
    const vibroRaw = parseNumber(payload.vibro);
    const lightRaw = parseNumber(payload.light);

    if (temp !== null) {
      const status = numericStatus(temp, 18, 28);
      const rounded = Math.round(temp * 10) / 10;
      this.updateSensor("esp32-temp", {
        value: rounded,
        status,
        lastUpdated: timestamp,
      });
      this.appendHistory("esp32-temp", rounded);
    }

    if (hum !== null) {
      const status = numericStatus(hum, 30, 70);
      const rounded = Math.round(hum * 10) / 10;
      this.updateSensor("esp32-hum", {
        value: rounded,
        status,
        lastUpdated: timestamp,
      });
      this.appendHistory("esp32-hum", rounded);
    }

    if (gas !== null) {
      const rounded = Math.round(gas);
      const status = numericStatus(rounded, undefined, 2500);
      this.updateSensor("esp32-gas", {
        value: rounded,
        status,
        lastUpdated: timestamp,
      });
      this.appendHistory("esp32-gas", rounded);
    }

    if (water !== null) {
      const rounded = Math.round(water);
      const status = waterStatus(rounded);
      this.updateSensor("esp32-water", {
        value: rounded,
        status,
        lastUpdated: timestamp,
      });
      this.appendHistory("esp32-water", rounded);
    }

    if (vibroRaw !== null) {
      const triggered = vibroRaw == 0;
      this.updateSensor("esp32-vibro", {
        value: triggered,
        status: triggered ? "warning" : "online",
        lastUpdated: timestamp,
      });
    }

    if (lightRaw !== null) {
      const lightOn = lightRaw == 1;
      this.updateSensor("esp32-light", {
        value: lightOn,
        status: "online",
        lastUpdated: timestamp,
      });
    }

    this.setPollingState(
      {
        status: "connected",
        lastSuccessAt: timestamp,
        lastError: null,
        usingLiveData: true,
      },
      false
    );
    this.emit();
  }

  private handleTelemetryTimeout() {
    const lastSuccessAt = this.pollingState.lastSuccessAt;
    if (!lastSuccessAt) return;

    const ageMs = Date.now() - new Date(lastSuccessAt).getTime();
    const offlineAfterMs = Math.max(this.pollingState.pollIntervalMs * 3, 12_000);
    if (ageMs < offlineAfterMs) return;

    const changed = this.markCoreSensorsOffline();
    if (changed) {
      this.setPollingState({ status: "offline" }, false);
      this.emit();
    }
  }

  private startStaleMonitor() {
    if (this.staleInterval || typeof window === "undefined") return;
    this.staleInterval = window.setInterval(() => this.handleTelemetryTimeout(), 5_000);
  }

  private async pollSensors() {
    if (typeof window === "undefined" || this.pollInFlight) return;

    const statusBefore = this.pollingState.usingLiveData ? "polling" : "connecting";
    this.pollInFlight = true;
    this.setPollingState({
      status: statusBefore,
      lastFetchAt: nowIso(),
    });

    try {
      const payload = await fetchJsonWithTimeout<EspHttpPayload>(
        this.pollingState.sensorsUrl
      );
      this.updateFromPayload(payload);
    } catch (error) {
      const friendlyError = getFriendlyFetchError(error);
      const hadLiveData = this.pollingState.usingLiveData;
      const changed = this.markCoreSensorsOffline();

      this.setPollingState(
        {
          status: hadLiveData ? "offline" : "error",
          lastError: friendlyError,
        },
        false
      );

      if (this.shouldNotify("http-fetch-error", 60_000)) {
        this.pushNotification({
          title: "Ошибка чтения ESP32",
          message: `${friendlyError} URL: ${this.pollingState.sensorsUrl}`,
          severity: hadLiveData ? "warning" : "critical",
          room: "Гостиная",
        });
      }

      if (changed || !hadLiveData) this.emit();
      console.error("ESP32 polling error", error);
    } finally {
      this.pollInFlight = false;
    }
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
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

  getPollingState(): HttpPollingStateSnapshot {
    return this.pollingState;
  }

  getMqttState(): HttpPollingStateSnapshot {
    return this.getPollingState();
  }

  async startPolling() {
    if (this.pollingStarted || typeof window === "undefined") return;
    this.pollingStarted = true;
    this.startStaleMonitor();
    await this.pollSensors();
    this.pollingInterval = window.setInterval(
      () => void this.pollSensors(),
      this.pollingState.pollIntervalMs
    );
  }

  async startMqtt() {
    await this.startPolling();
  }

  async refreshNow() {
    await this.pollSensors();
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

    const sensor: Sensor = {
      id,
      name: data.name,
      type: data.type,
      room: data.room,
      espIp: data.espIp,
      espName: data.espName,
      value: isBool ? false : 0,
      unit: data.unit,
      status: "offline",
      lastUpdated: nowIso(),
      minThreshold: data.minThreshold,
      maxThreshold: data.maxThreshold,
    };

    this.sensors.push(sensor);
    if (!isBool) {
      this.histories[id] = [];
    }

    this.pushNotification({
      title: "Датчик добавлен",
      message: `Датчик «${data.name}» добавлен в интерфейс. Для живых данных его нужно отдельно связать с JSON-ответом ESP32.`,
      severity: "info",
      sensorId: id,
      sensorName: data.name,
      room: data.room,
    });

    this.emit();
    return sensor;
  }

  removeSensor(id: string) {
    const sensor = this.sensors.find((s) => s.id === id);
    if (!sensor) return;
    this.sensors = this.sensors.filter((s) => s.id !== id);
    delete this.histories[id];

    this.pushNotification({
      title: "Датчик удалён",
      message: `Датчик «${sensor.name}» был удалён из интерфейса.`,
      severity: "warning",
      sensorId: id,
      sensorName: sensor.name,
      room: sensor.room,
    });

    this.emit();
  }
}

export const sensorStore = new SensorStore();
