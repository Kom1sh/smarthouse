import { HouseInfo, Room, EspDevice } from "./types";
import { mockHouseInfo } from "./mockData";

type Listener = () => void;

class HouseStore {
  private data: HouseInfo;
  private listeners: Set<Listener> = new Set();
  private _snapshot: HouseInfo;

  constructor() {
    this.data = { ...mockHouseInfo, rooms: [...mockHouseInfo.rooms], espDevices: [...mockHouseInfo.espDevices] };
    this._snapshot = this.clone();
  }

  private clone(): HouseInfo {
    return {
      ...this.data,
      rooms: this.data.rooms.map((r) => ({ ...r, sensors: [...r.sensors] })),
      espDevices: this.data.espDevices.map((e) => ({ ...e, sensors: [...e.sensors] })),
    };
  }

  private emit() {
    this._snapshot = this.clone();
    this.listeners.forEach((fn) => fn());
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  getSnapshot(): HouseInfo {
    return this._snapshot;
  }

  updateInfo(patch: Partial<Pick<HouseInfo, "name" | "address" | "area" | "floors" | "owner" | "timezone">>) {
    Object.assign(this.data, patch);
    this.emit();
  }

  addRoom(room: Omit<Room, "id">) {
    const id = `r-${Date.now()}`;
    this.data.rooms.push({ ...room, id });
    this.emit();
  }

  updateRoom(id: string, patch: Partial<Omit<Room, "id">>) {
    const room = this.data.rooms.find((r) => r.id === id);
    if (room) {
      Object.assign(room, patch);
      this.emit();
    }
  }

  removeRoom(id: string) {
    this.data.rooms = this.data.rooms.filter((r) => r.id !== id);
    this.emit();
  }

  addEspDevice(device: Omit<EspDevice, "id">) {
    const id = `esp-${Date.now()}`;
    this.data.espDevices.push({ ...device, id });
    this.emit();
  }

  updateEspDevice(id: string, patch: Partial<Omit<EspDevice, "id">>) {
    const device = this.data.espDevices.find((d) => d.id === id);
    if (device) {
      Object.assign(device, patch);
      this.emit();
    }
  }

  removeEspDevice(id: string) {
    this.data.espDevices = this.data.espDevices.filter((d) => d.id !== id);
    this.emit();
  }
}

export const houseStore = new HouseStore();
