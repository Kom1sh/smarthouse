import { Sensor, SensorHistory, Notification, HouseInfo, ReportRequest, ReportData, DashboardStats } from "./types";
import {
  mockSensors,
  mockNotifications,
  mockHouseInfo,
  mockDashboardStats,
  mockSensorHistories,
} from "./mockData";
import { subHours, subMinutes, format } from "date-fns";

const USE_MOCK = true;

async function fetchEsp<T>(ip: string, path: string): Promise<T> {
  const res = await fetch(`http://${ip}${path}`, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`ESP ${ip} responded with ${res.status}`);
  return res.json();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (USE_MOCK) {
    await delay(300);
    return mockDashboardStats;
  }
  throw new Error("Not implemented");
}

export async function getAllSensors(): Promise<Sensor[]> {
  if (USE_MOCK) {
    await delay(400);
    return mockSensors;
  }
  throw new Error("Not implemented");
}

export async function getSensor(id: string): Promise<Sensor | undefined> {
  if (USE_MOCK) {
    await delay(200);
    return mockSensors.find((s) => s.id === id);
  }
  throw new Error("Not implemented");
}

export async function getSensorHistory(sensorId: string): Promise<{ timestamp: string; value: number }[]> {
  if (USE_MOCK) {
    await delay(350);
    return mockSensorHistories[sensorId] ?? [];
  }
  throw new Error("Not implemented");
}

export async function getNotifications(): Promise<Notification[]> {
  if (USE_MOCK) {
    await delay(300);
    return mockNotifications;
  }
  throw new Error("Not implemented");
}

export async function markNotificationRead(id: string): Promise<void> {
  if (USE_MOCK) {
    await delay(100);
    const n = mockNotifications.find((n) => n.id === id);
    if (n) n.read = true;
    return;
  }
  throw new Error("Not implemented");
}

export async function markAllNotificationsRead(): Promise<void> {
  if (USE_MOCK) {
    await delay(100);
    mockNotifications.forEach((n) => (n.read = true));
    return;
  }
  throw new Error("Not implemented");
}

export async function getHouseInfo(): Promise<HouseInfo> {
  if (USE_MOCK) {
    await delay(300);
    return mockHouseInfo;
  }
  throw new Error("Not implemented");
}

export async function generateReport(request: ReportRequest): Promise<ReportData[]> {
  if (USE_MOCK) {
    await delay(800);
    return request.sensorIds
      .map((id) => {
        const sensor = mockSensors.find((s) => s.id === id);
        if (!sensor || typeof sensor.value !== "number") return null;

        const baseVal = sensor.value as number;
        const readings = generateReportReadings(request.from, request.to, request.interval, baseVal);
        const values = readings.map((r) => r.value as number);

        return {
          sensorId: id,
          sensorName: sensor.name,
          unit: sensor.unit,
          readings,
          avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10,
          min: Math.round(Math.min(...values) * 10) / 10,
          max: Math.round(Math.max(...values) * 10) / 10,
        } as ReportData;
      })
      .filter(Boolean) as ReportData[];
  }
  throw new Error("Not implemented");
}

function generateReportReadings(
  from: string,
  to: string,
  interval: "minute" | "hour" | "day",
  baseValue: number
) {
  const start = new Date(from);
  const end = new Date(to);
  const readings: { timestamp: string; value: number }[] = [];

  const stepMs =
    interval === "minute" ? 60_000 : interval === "hour" ? 3_600_000 : 86_400_000;

  let current = start.getTime();
  while (current <= end.getTime()) {
    const noise = (Math.random() - 0.5) * baseValue * 0.1;
    readings.push({
      timestamp: format(new Date(current), interval === "day" ? "dd.MM" : "HH:mm"),
      value: Math.round((baseValue + noise) * 10) / 10,
    });
    current += stepMs;
  }
  return readings;
}

export async function pingEsp(ip: string): Promise<boolean> {
  if (USE_MOCK) {
    await delay(200);
    return Math.random() > 0.1;
  }
  try {
    await fetchEsp(ip, "/ping");
    return true;
  } catch {
    return false;
  }
}

function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}
