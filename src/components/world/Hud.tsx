"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { WORLD, districts, type Poi } from "@/data/world";
import { input } from "./controls";
import { carState, useWorldStore } from "./store";

const noopSubscribe = () => () => {};

export type AltLink = { href: string; label: string };

export type MapCfg = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  districts: Array<{ id: string; name: string; x: number; z: number }>;
};

const defaultMapCfg: MapCfg = {
  minX: -WORLD.fence,
  maxX: WORLD.fence,
  minZ: -WORLD.fence,
  maxZ: WORLD.fence,
  districts,
};

export function Hud({
  alts,
  desc,
  mapCfg,
  hint,
  minimap = true,
}: {
  alts?: AltLink[];
  desc?: React.ReactNode;
  mapCfg?: MapCfg;
  hint?: string;
  /** false 时不渲染 DOM 小地图（世界自带画布小地图时用） */
  minimap?: boolean;
}) {
  const phase = useWorldStore((s) => s.phase);
  const poi = useWorldStore((s) => s.poi);
  const touch = useSyncExternalStore(
    noopSubscribe,
    () =>
      new URLSearchParams(window.location.search).has("touch") || // 调试：?touch=1 强制触屏 UI
      window.matchMedia?.("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0,
    () => false
  );

  // iOS 微信内关闭 backdrop-filter（支持但 GPU 合成很慢）
  const isIOSWechat =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod/.test(navigator.userAgent) &&
    /MicroMessenger/.test(navigator.userAgent);

  useEffect(() => {
    if (isIOSWechat) {
      document.documentElement.classList.add("ios-wechat");
      return () => document.documentElement.classList.remove("ios-wechat");
    }
  }, [isIOSWechat]);

  return (
    <>
      {phase === "intro" && <IntroOverlay touch={touch} alts={alts} desc={desc} iosWechat={isIOSWechat} />}
      {phase === "drive" && (
        <>
          <TopBar alts={alts} />
          {minimap && <Minimap cfg={mapCfg ?? defaultMapCfg} />}
          <DistrictToast iosWechat={isIOSWechat} />
          <PoiCard iosWechat={isIOSWechat} />
          {touch && <ZoomControl iosWechat={isIOSWechat} />}
          {touch && !poi && <TouchHint iosWechat={isIOSWechat} />}
          {touch && !poi && <Joystick iosWechat={isIOSWechat} />}
          {!touch && (
            <div className="absolute bottom-5 right-5 z-20 mono text-[11px] tracking-widest text-faint pointer-events-none hidden md:block">
              {hint ?? "WASD 驾驶 · SHIFT 加速 · R 复位 · 滚轮 缩放"}
            </div>
          )}
        </>
      )}
    </>
  );
}

/* ────────────────────────── 开场 ────────────────────────── */

function IntroOverlay({
  touch,
  alts,
  desc,
  iosWechat = false,
}: {
  touch: boolean;
  alts?: AltLink[];
  desc?: React.ReactNode;
  iosWechat?: boolean;
}) {
  const enter = useWorldStore((s) => s.enter);
  // 手机（含微信浏览器）：点屏幕任意处进入地图；桌面维持点按钮
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  // 检测竖屏/横屏，竖屏时引导用户旋转手机
  const [isPortrait, setIsPortrait] = useState(true);
  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth);
    check();
    const mq = window.matchMedia("(orientation: portrait)");
    mq.addEventListener("change", check);
    return () => mq.removeEventListener("change", check);
  }, []);

  const overlayBg = iosWechat
    ? "bg-[rgba(241,235,221,0.92)]"
    : "bg-[rgba(241,235,221,0.9)] backdrop-blur-[2px]";

  // 手机竖屏：旋转引导；手机横屏：探索说明；桌面：键盘说明
  const guideBlock = () => {
    if (!touch) {
      return (
        <>
          <div className="flex flex-col items-center gap-1.5">
            <Key label="W" />
            <div className="flex gap-1.5">
              <Key label="A" />
              <Key label="S" />
              <Key label="D" />
            </div>
          </div>
          <div className="mono text-[11px] text-faint text-left leading-loose tracking-wider">
            <p><span className="text-dim">WASD / 方向键</span> 驾驶</p>
            <p><span className="text-dim">SHIFT</span> 加速 · <span className="text-dim">R</span> 复位</p>
            <p><span className="text-dim">滚轮</span> 缩放视野</p>
          </div>
        </>
      );
    }
    if (isPortrait) {
      return (
        <div className="flex flex-col items-center gap-3">
          {/* 手机旋转图标 */}
          <div className="anim-rotate-phone w-14 h-14 flex items-center justify-center">
            <svg viewBox="0 0 40 72" className="w-9 h-16 text-accent" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="32" height="64" rx="5" />
              <line x1="20" y1="56" x2="20" y2="56" strokeWidth="3.5" />
            </svg>
          </div>
          <p className="text-base font-semibold tracking-wide">旋转手机，横屏探索</p>
          <p className="text-xs text-faint">画面为宽屏设计，横屏视野更完整</p>
        </div>
      );
    }
    return (
      <div className="mono text-xs text-dim tracking-wider leading-relaxed">
        摇杆驾驶 · 探索局部
        <br />
        双指缩放 · 点装置看详情
      </div>
    );
  };

  return (
    <div
      className={`absolute inset-0 z-40 overflow-y-auto ${overlayBg}`}
      onClick={touch ? enter : undefined}
    >
      <div className="blueprint absolute inset-0 pointer-events-none" aria-hidden="true" />
      <div className="relative min-h-full flex items-center justify-center px-6 py-8">
        <div className="intro-panel max-w-xl w-full text-center">
        <div className="intro-status mono text-xs text-faint tracking-widest flex items-center justify-center gap-3 mb-5 sm:mb-8">
          <span className="dot-live" aria-hidden="true" />
          <span className="text-dim">WORLD ONLINE</span>
          <span aria-hidden="true">·</span>
          <span>SHIZIFAN.COM</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-3 sm:mb-4">
          石子凡
        </h1>
        <p className="intro-sub text-lg md:text-xl text-accent mb-2">
          让 AI 为人创造价值
        </p>
        <p className="intro-tag mono text-xs text-faint tracking-[0.28em] mb-5 sm:mb-8">
          相信未来 / 笃行当下
        </p>

        {/* 手机竖屏时压缩描述文案，给旋转引导让空间 */}
        {(!touch || !isPortrait) && (
          <p className="intro-desc text-text text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-6 sm:mb-8">
            {desc ?? (
              <>
                这是我的<span className="text-text">能力与产品地图</span>
                ——北边是 6 个已上线的产品，东边是能力公园，
                南边是企业级工程，西边是观点大道。开车逛逛，撞翻几个箱子也没关系。
              </>
            )}
          </p>
        )}

        {/* 操作说明 / 旋转引导 */}
        <div className="intro-ctrls flex items-center justify-center mb-7 sm:mb-10">
          {guideBlock()}
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={enter}
            className="mono text-sm bg-accent text-white font-medium px-8 py-3.5 hover:brightness-110 transition-all duration-200 cursor-pointer"
          >
            启动引擎 →
          </button>
          <Link
            href="/classic"
            onClick={stop}
            className="mono text-sm border border-line px-6 py-3.5 text-dim hover:text-accent hover:border-accent/50 transition-colors duration-200"
          >
            看简历版
          </Link>
          {alts?.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              onClick={stop}
              className="mono text-sm border border-line px-6 py-3.5 text-dim hover:text-accent hover:border-accent/50 transition-colors duration-200"
            >
              {a.label}
            </Link>
          ))}
        </div>

        {touch && (
          <p className="mono text-[11px] text-accent tracking-wider mt-4 hud-pulse">
            {isPortrait ? "— 轻触屏幕任意处进入 —" : "— 轻触屏幕任意处进入 —"}
          </p>
        )}

        <p className="intro-foot mono text-[10px] text-faint tracking-wider mt-6 sm:mt-8">
          {touch ? "摇杆驾驶探索 · 点空白处收起卡片" : "随时按 R 复位"}
        </p>
        </div>
      </div>
    </div>
  );
}

function Key({ label }: { label: string }) {
  return (
    <span className="mono w-9 h-9 border border-line-strong text-dim text-xs flex items-center justify-center bg-raise">
      {label}
    </span>
  );
}

/* ────────────────────────── 顶栏 ────────────────────────── */

function TopBar({ alts }: { alts?: AltLink[] }) {
  const chip =
    "pointer-events-auto mono text-xs border border-line px-3.5 py-2 text-dim hover:text-accent hover:border-accent/50 transition-colors duration-200 bg-[rgba(250,246,234,0.75)]";
  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4 pointer-events-none">
      <div className="flex items-center gap-2.5">
        <span className="text-accent mono text-sm leading-none">▍</span>
        <span className="text-sm font-medium tracking-wide">
          石子凡 <span className="text-faint mono text-xs ml-2">能力与产品地图</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        {alts?.map((a) => (
          <Link key={a.href} href={a.href} className={chip}>
            {a.label} →
          </Link>
        ))}
        <Link href="/classic" className={chip}>
          简历版 →
        </Link>
      </div>
    </div>
  );
}

/* ────────────────────────── 小地图 ────────────────────────── */

const MAP_W = 150;

function Minimap({ cfg }: { cfg: MapCfg }) {
  const carRef = useRef<HTMLDivElement>(null);
  const rangeX = cfg.maxX - cfg.minX;
  const rangeZ = cfg.maxZ - cfg.minZ;
  const mapH = Math.round((MAP_W * rangeZ) / rangeX);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const el = carRef.current;
      if (el) {
        const x = ((carState.x - cfg.minX) / rangeX) * MAP_W;
        const y = ((carState.z - cfg.minZ) / rangeZ) * mapH;
        const deg = ((Math.PI - carState.heading) * 180) / Math.PI;
        el.style.transform = `translate(${x - 5}px, ${y - 6}px) rotate(${deg}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cfg.minX, cfg.minZ, rangeX, rangeZ, mapH]);

  return (
    <div
      className="absolute top-14 right-5 z-20 border border-line bg-[rgba(250,246,234,0.8)] backdrop-blur-sm pointer-events-none hidden sm:block"
      style={{ width: MAP_W, height: mapH }}
    >
      {cfg.districts
        .filter((d) => d.id !== "spawn")
        .map((d) => (
          <div
            key={d.id}
            className="absolute flex flex-col items-center"
            style={{
              left: ((d.x - cfg.minX) / rangeX) * MAP_W,
              top: ((d.z - cfg.minZ) / rangeZ) * mapH,
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="w-1 h-1 rounded-full bg-accent/70" />
            <span className="text-[8px] text-faint leading-tight mt-0.5 whitespace-nowrap">
              {d.name}
            </span>
          </div>
        ))}
      {/* 载具 */}
      <div ref={carRef} className="absolute left-0 top-0 will-change-transform">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: "11px solid #b45309",
          }}
        />
      </div>
      <span className="absolute bottom-1 left-1.5 mono text-[8px] tracking-widest text-faint">
        MAP
      </span>
    </div>
  );
}

/* ────────────────────────── 分区提示 ────────────────────────── */

function DistrictToast({ iosWechat = false }: { iosWechat?: boolean }) {
  const district = useWorldStore((s) => s.district);
  if (!district || district.id === "spawn") return null;
  const glassBg = iosWechat
    ? "bg-[rgba(250,246,234,0.92)]"
    : "bg-[rgba(250,246,234,0.85)] backdrop-blur-sm";
  return (
    <div
      key={district.id}
      className="hud-toast absolute left-1/2 z-20 pointer-events-none"
      style={{ top: `calc(4rem + var(--safe-top, 0px))`, transform: "translateX(-50%)" }}
    >
      <div className={`border border-line ${glassBg} px-5 py-2 text-center`}>
        <p className="text-sm font-medium">{district.name}</p>
        <p className="mono text-[9px] tracking-[0.3em] text-accent mt-0.5">
          {district.en}
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────── POI 信息卡 ────────────────────────── */

const HAND_FONT = "'Kaiti SC','STKaiti','KaiTi',cursive";

function PoiCard({ iosWechat = false }: { iosWechat?: boolean }) {
  const poi = useWorldStore((s) => s.poi);
  if (!poi) return null;
  const hue = poi.hue ?? "#b45309";
  const glassBg = iosWechat
    ? "bg-[rgba(255,253,246,0.98)]"
    : "bg-[rgba(255,253,246,0.95)] backdrop-blur-md";
  return (
    <div
      key={poi.id}
      className="absolute left-1/2 z-30 w-[min(92vw,560px)] pointer-events-none hud-card"
      style={{ bottom: `calc(1.25rem + var(--safe-bottom, 0px))`, transform: "translateX(-50%)" }}
    >
      <div className={`border border-line-strong ${glassBg} shadow-[4px_5px_0_rgba(42,48,55,0.08)]`}>
        {/* 顶带：卡片上唯一的彩色 */}
        <div className="h-1.5" style={{ background: hue }} />
        {/* 图签式表头：编号章 | 名称 | 类别 */}
        <div className="flex items-stretch border-b border-line">
          <div className="flex items-center justify-center w-14 border-r border-line py-2 shrink-0">
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center mono text-[11px] font-bold"
              style={{ border: `3px double ${hue}`, color: hue }}
            >
              {poi.no ?? "·"}
            </span>
          </div>
          <div className="flex-1 min-w-0 px-3 py-2">
            <h3 className="text-base font-bold tracking-tight leading-tight truncate">
              {poi.title}
            </h3>
            <p className="mono text-[9px] tracking-[0.16em] text-accent mt-1">{poi.label}</p>
          </div>
          {poi.meta && (
            <div className="hidden sm:flex items-center max-w-[160px] px-3 border-l border-line mono text-[9px] text-faint leading-snug shrink-0">
              {poi.meta}
            </div>
          )}
        </div>
        {/* 正文 */}
        <div className="px-4 py-3">
          <p className="text-sm sm:text-[13px] text-dim leading-relaxed">{poi.body}</p>
          {poi.tags && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {poi.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          )}
          {poi.hand && (
            <p className="mt-2.5 text-[13.5px] text-faint" style={{ fontFamily: HAND_FONT }}>
              —— {poi.hand}
            </p>
          )}
          {poi.link && <PoiLink poi={poi} />}
        </div>
        {/* 底栏：版次 + 小章 */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-line mono text-[9px] text-faint">
          <span>REV 2026.07 · 1:1 运行中</span>
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
            style={{ border: "1.5px solid #b45309", color: "#b45309", fontFamily: HAND_FONT }}
          >
            石
          </span>
        </div>
      </div>
    </div>
  );
}

function PoiLink({ poi }: { poi: Poi }) {
  const external = poi.link!.startsWith("http") || poi.link!.startsWith("mailto");
  const cls =
    "pointer-events-auto inline-block mono text-xs bg-accent text-white font-medium px-4 py-2 mt-2 hover:brightness-110 transition-all duration-200";
  return external ? (
    <a href={poi.link} target={poi.link!.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className={cls}>
      {poi.linkText ?? "查看 ↗"}
    </a>
  ) : (
    <Link href={poi.link!} className={cls}>
      {poi.linkText ?? "查看 →"}
    </Link>
  );
}

/* ────────────────────────── 触屏缩放控件 ────────────────────────── */

function ZoomControl({ iosWechat = false }: { iosWechat?: boolean }) {
  const glassBg = iosWechat
    ? "bg-[rgba(250,246,234,0.92)]"
    : "bg-[rgba(250,246,234,0.85)] backdrop-blur-sm";
  const btn =
    `pointer-events-auto w-11 h-11 flex items-center justify-center border border-line-strong ${glassBg} text-dim active:bg-accent/15 select-none touch-none`;
  return (
    <div
      className="absolute z-30 flex flex-col gap-2"
      style={{ top: "50%", transform: "translateY(-50%)", left: `calc(0.75rem + var(--safe-left, 0px))` }}
    >
      <button className={`${btn} text-xl leading-none`} onClick={() => (input.zoomStep = 1)} aria-label="放大">
        ＋
      </button>
      <button className={`${btn} text-xl leading-none`} onClick={() => (input.zoomStep = -1)} aria-label="缩小">
        －
      </button>
      <button
        className={`${btn} mono text-[9px] tracking-tight leading-tight text-center`}
        onClick={() => (input.fitReq = true)}
        aria-label="看全貌"
      >
        看全貌
      </button>
    </div>
  );
}

/* ────────────────────────── 触屏手势提示（短暂显示） ────────────────────────── */

function TouchHint({ iosWechat = false }: { iosWechat?: boolean }) {
  const [show, setShow] = useState(true);
  const glassBg = iosWechat
    ? "bg-[rgba(250,246,234,0.95)]"
    : "bg-[rgba(250,246,234,0.9)] backdrop-blur-sm";
  useEffect(() => {
    const timer = window.setTimeout(() => setShow(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);
  if (!show) return null;
  return (
    <div className="hud-hint absolute bottom-40 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
      <div className={`border border-line ${glassBg} px-4 py-2 text-center`}>
        <p className="mono text-[11px] tracking-wide text-dim">双指缩放 · 拖动平移 · 点装置看详情</p>
      </div>
    </div>
  );
}

/* ────────────────────────── 虚拟摇杆 ────────────────────────── */

const JOY_R = 36;

function Joystick({ iosWechat = false }: { iosWechat?: boolean }) {
  const knob = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const glassBg = iosWechat
    ? "bg-[rgba(250,246,234,0.8)]"
    : "bg-[rgba(250,246,234,0.6)] backdrop-blur-sm";

  // 卸载（如卡片打开时）务必归零，避免胶囊被冻结的摇杆量一直推着走
  useEffect(() => {
    return () => {
      input.joyActive = false;
      input.joyX = 0;
      input.joyY = 0;
    };
  }, []);

  const setKnob = (dx: number, dy: number) => {
    if (knob.current) {
      knob.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  };

  const onPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (e.type === "pointerdown") {
      active.current = true;
      el.setPointerCapture(e.pointerId);
    }
    if (!active.current) return;
    if (e.type === "pointerup" || e.type === "pointercancel") {
      active.current = false;
      input.joyActive = false;
      input.joyX = 0;
      input.joyY = 0;
      setKnob(0, 0);
      return;
    }
    const rect = el.getBoundingClientRect();
    let dx = e.clientX - (rect.left + rect.width / 2);
    let dy = e.clientY - (rect.top + rect.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > JOY_R) {
      dx = (dx / d) * JOY_R;
      dy = (dy / d) * JOY_R;
    }
    input.joyActive = true;
    input.joyX = dx / JOY_R;
    input.joyY = dy / JOY_R;
    setKnob(dx, dy);
  };

  return (
    <div
      className={`absolute z-30 rounded-full border border-line-strong ${glassBg} flex items-center justify-center touch-none`}
      style={{
        width: JOY_R * 2 + 28,
        height: JOY_R * 2 + 28,
        bottom: `calc(1.75rem + var(--safe-bottom, 0px))`,
        right: `calc(1.75rem + var(--safe-right, 0px))`,
      }}
      onPointerDown={onPointer}
      onPointerMove={onPointer}
      onPointerUp={onPointer}
      onPointerCancel={onPointer}
    >
      <div
        ref={knob}
        className="rounded-full bg-accent/85 will-change-transform"
        style={{ width: 32, height: 32 }}
      />
    </div>
  );
}
