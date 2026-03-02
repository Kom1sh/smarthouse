export type SensorType =
  | "temperature"
  | "humidity"
  | "pressure"
  | "motion"
  | "smoke"
  | "co2"
  | "light"
  | "water_leak"
  | "door"
  | "window";

export type SensorStatus = "online" | "offline" | "warning" | "critical";

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  room: string;
  espIp: string;
  espName: string;
  value: number | boolean;
  unit: string;
  status: SensorStatus;
  lastUpdated: string;
  batteryLevel?: number;
  minThreshold?: number;
  maxThreshold?: number;
}

export interface SensorReading {
  timestamp: string;
  value: number | boolean;
}

export interface SensorHistory {
  sensorId: string;
  readings: SensorReading[];
}

export type NotificationSeverity = "info" | "warning" | "critical";

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  sensorId?: string;
  sensorName?: string;
  room?: string;
  timestamp: string;
  read: boolean;
}

export interface Room {
  id: string;
  name: string;
  icon: string;
  area: number;
  floor: number;
  sensors: string[];
}

export interface EspDevice {
  id: string;
  name: string;
  ip: string;
  status: "online" | "offline";
  firmware: string;
  lastSeen: string;
  sensors: string[];
  rssi: number;
  uptime: number;
}

export interface HouseInfo {
  name: string;
  address: string;
  area: number;
  floors: number;
  rooms: Room[];
  espDevices: EspDevice[];
  timezone: string;
  owner: string;
}

export interface ReportRequest {
  sensorIds: string[];
  from: string;
  to: string;
  interval: "minute" | "hour" | "day";
}

export interface ReportData {
  sensorId: string;
  sensorName: string;
  unit: string;
  readings: SensorReading[];
  avg: number;
  min: number;
  max: number;
}

export interface DashboardStats {
  totalSensors: number;
  onlineSensors: number;
  offlineSensors: number;
  warningSensors: number;
  unreadNotifications: number;
  rooms: number;
  espDevices: number;
  espOnline: number;
}
