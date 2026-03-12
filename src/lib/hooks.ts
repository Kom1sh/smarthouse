import { useSyncExternalStore } from "react";
import { sensorStore } from "./sensorStore";
import { houseStore } from "./houseStore";
import { Sensor, Notification, HouseInfo } from "./types";

const subscribeFn = (cb: () => void) => sensorStore.subscribe(cb);
const getSensorsSnapshot = () => sensorStore.getSensors();
const getNotificationsSnapshot = () => sensorStore.getNotifications();
const getUnreadSnapshot = () => sensorStore.getUnreadCount();

export function useSensors(): Sensor[] {
  return useSyncExternalStore(subscribeFn, getSensorsSnapshot, getSensorsSnapshot);
}

export function useNotifications(): Notification[] {
  return useSyncExternalStore(subscribeFn, getNotificationsSnapshot, getNotificationsSnapshot);
}

export function useUnreadCount(): number {
  return useSyncExternalStore(subscribeFn, getUnreadSnapshot, getUnreadSnapshot);
}

const houseSubscribeFn = (cb: () => void) => houseStore.subscribe(cb);
const getHouseSnapshot = () => houseStore.getSnapshot();

export function useHouseInfo(): HouseInfo {
  return useSyncExternalStore(houseSubscribeFn, getHouseSnapshot, getHouseSnapshot);
}
