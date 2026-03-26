"use client";

import { useEffect } from "react";
import { sensorStore } from "@/lib/sensorStore";

export default function MqttBootstrap() {
  useEffect(() => {
    void sensorStore.startPolling();
  }, []);

  return null;
}
