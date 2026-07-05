"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Hud } from "./Hud";
import { resetCar, setSpawn, useWorldStore } from "./store";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <BootVeil />,
});

export default function WorldApp() {
  useEffect(() => {
    // 本世界的出生点 + 清理跨世界残留状态
    setSpawn(0, 10, Math.PI);
    resetCar();
    const st = useWorldStore.getState();
    st.setPoi(null);
    st.setDistrict(null);
  }, []);

  return (
    <div className="theme-paper fixed inset-0 overflow-hidden bg-bg text-text select-none">
      <Scene />
      <Hud
        alts={[
          { href: "/", label: "系统图" },
          { href: "/pixel", label: "像素版" },
        ]}
      />
    </div>
  );
}

function BootVeil() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <p className="mono text-xs tracking-[0.3em] text-dim animate-pulse">
          BOOTING WORLD…
        </p>
        <p className="mono text-[10px] text-faint mt-3 tracking-wider">
          正在铺设主板与道路
        </p>
      </div>
    </div>
  );
}
