import { create } from "zustand";
import type { District, Poi } from "@/data/world";

/** 每帧高频更新的载具状态 —— 走可变对象，绕过 React 渲染 */
export const carState = {
  x: 0,
  z: 10,
  heading: Math.PI, // 朝北
  speed: 0,
  steer: 0,
};

/** 出生点（各世界在挂载时配置自己的） */
const spawn = { x: 0, z: 10, heading: Math.PI };

export function setSpawn(x: number, z: number, heading: number) {
  spawn.x = x;
  spawn.z = z;
  spawn.heading = heading;
}

export function resetCar() {
  carState.x = spawn.x;
  carState.z = spawn.z;
  carState.heading = spawn.heading;
  carState.speed = 0;
  carState.steer = 0;
}

type Phase = "intro" | "drive";

type WorldStore = {
  phase: Phase;
  enter: () => void;
  poi: Poi | null;
  setPoi: (p: Poi | null) => void;
  district: District | null;
  setDistrict: (d: District | null) => void;
  visited: Set<string>;
};

export const useWorldStore = create<WorldStore>((set) => ({
  phase: "intro",
  enter: () => set({ phase: "drive" }),
  poi: null,
  setPoi: (poi) => set({ poi }),
  district: null,
  setDistrict: (district) =>
    set((s) => {
      if (district) s.visited.add(district.id);
      return { district };
    }),
  visited: new Set<string>(),
}));
