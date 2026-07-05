import * as THREE from "three";

/**
 * 用 Canvas 生成贴图 —— 中文直接走系统字体，零字体文件开销。
 * 仅在客户端调用（场景整体 ssr:false）。
 */

const SANS = `"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif`;
const MONO = `"JetBrains Mono","SF Mono",Menlo,Consolas,monospace`;

export type LabelLine = {
  text: string;
  /** 相对画布高度的字号（px，按 2x 绘制） */
  size: number;
  color?: string;
  mono?: boolean;
  weight?: number;
  letterSpacing?: number;
  /** 与上一行的间距 */
  gap?: number;
};

export type LabelOpts = {
  w: number;
  h: number;
  lines: LabelLine[];
  bg?: string;
  /** 边框颜色（画在最外圈） */
  border?: string;
  align?: "center" | "left";
  padding?: number;
};

/** 按字符折行（对 CJK 友好） */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const out: string[] = [];
  let cur = "";
  for (const ch of text) {
    if (ctx.measureText(cur + ch).width > maxWidth && cur) {
      out.push(cur);
      cur = ch;
    } else {
      cur += ch;
    }
  }
  if (cur) out.push(cur);
  return out;
}

export function makeLabelTexture(opts: LabelOpts): THREE.CanvasTexture {
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = opts.w * scale;
  canvas.height = opts.h * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  if (opts.bg) {
    ctx.fillStyle = opts.bg;
    ctx.fillRect(0, 0, opts.w, opts.h);
  }
  if (opts.border) {
    ctx.strokeStyle = opts.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, opts.w - 6, opts.h - 6);
  }

  const pad = opts.padding ?? 12;
  const align = opts.align ?? "center";
  ctx.textAlign = align === "center" ? "center" : "left";
  ctx.textBaseline = "middle";
  const x = align === "center" ? opts.w / 2 : pad;

  // 先展开折行，算总高，再垂直居中
  const rendered: Array<{ text: string; line: LabelLine }> = [];
  for (const line of opts.lines) {
    ctx.font = `${line.weight ?? 600} ${line.size}px ${line.mono ? MONO : SANS}`;
    const rows = wrapText(ctx, line.text, opts.w - pad * 2);
    for (let i = 0; i < rows.length; i++) {
      rendered.push({ text: rows[i], line });
    }
  }
  const lineHeight = (l: LabelLine) => l.size * 1.32;
  let total = 0;
  for (let i = 0; i < rendered.length; i++) {
    total += lineHeight(rendered[i].line);
    if (i > 0 && rendered[i].line !== rendered[i - 1].line) {
      total += rendered[i].line.gap ?? 6;
    }
  }
  let y = (opts.h - total) / 2;
  for (let i = 0; i < rendered.length; i++) {
    const { text, line } = rendered[i];
    if (i > 0 && line !== rendered[i - 1].line) y += line.gap ?? 6;
    ctx.font = `${line.weight ?? 600} ${line.size}px ${line.mono ? MONO : SANS}`;
    ctx.fillStyle = line.color ?? "#232b36";
    if (line.letterSpacing) {
      // 手动排字距
      const chars = [...text];
      const widths = chars.map((c) => ctx.measureText(c).width);
      const tw =
        widths.reduce((a, b) => a + b, 0) +
        line.letterSpacing * (chars.length - 1);
      let cx = align === "center" ? x - tw / 2 : x;
      ctx.textAlign = "left";
      for (let j = 0; j < chars.length; j++) {
        ctx.fillText(chars[j], cx, y + lineHeight(line) / 2);
        cx += widths[j] + line.letterSpacing;
      }
      ctx.textAlign = align === "center" ? "center" : "left";
    } else {
      ctx.fillText(text, x, y + lineHeight(line) / 2);
    }
    y += lineHeight(line);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** 建筑外立面：透明底上画窗格（贴在墙面前 0.06） */
export function makeFacadeTexture(opts: {
  cols: number;
  rows: number;
  w: number;
  h: number;
  door?: boolean;
  industrial?: boolean;
}): THREE.CanvasTexture {
  const scale = 3;
  const canvas = document.createElement("canvas");
  canvas.width = opts.w * scale * 14;
  canvas.height = opts.h * scale * 14;
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  const padX = W * 0.08;
  const padTop = H * 0.14;
  const padBottom = opts.door ? H * 0.3 : H * 0.14;
  const gw = (W - padX * 2) / opts.cols;
  const gh = (H - padTop - padBottom) / opts.rows;

  for (let r = 0; r < opts.rows; r++) {
    for (let c = 0; c < opts.cols; c++) {
      const x = padX + c * gw + gw * 0.15;
      const y = padTop + r * gh + gh * 0.15;
      const ww = gw * 0.7;
      const wh = gh * 0.7;
      // 窗框
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(x - 3, y - 3, ww + 6, wh + 6);
      // 玻璃（带一点天空渐变）
      const g = ctx.createLinearGradient(0, y, 0, y + wh);
      g.addColorStop(0, "#9fb9cd");
      g.addColorStop(1, "#5f7d95");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, ww, wh);
      if (opts.industrial) {
        // 工业窗中梃
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + ww / 2, y);
        ctx.lineTo(x + ww / 2, y + wh);
        ctx.stroke();
      }
    }
  }

  if (opts.door) {
    const dw = W * 0.16;
    const dh = H * 0.24;
    const dx = W / 2 - dw / 2;
    const dy = H - dh;
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(dx - 4, dy - 4, dw + 8, dh + 4);
    ctx.fillStyle = "#3a4452";
    ctx.fillRect(dx, dy, dw, dh);
    ctx.fillStyle = "#c9a227";
    ctx.fillRect(dx + dw * 0.72, dy + dh * 0.45, 6, 14);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** 晨光图纸风地面纹理：暖纸底 + 墨色细网格 + 琥珀走线 + 过孔 */
export function makePcbTexture(): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#e9e1cd";
  ctx.fillRect(0, 0, S, S);

  // 细网格
  ctx.strokeStyle = "rgba(35,43,54,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= S; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i + 0.5, 0);
    ctx.lineTo(i + 0.5, S);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i + 0.5);
    ctx.lineTo(S, i + 0.5);
    ctx.stroke();
  }

  // 伪随机（固定种子，保证 tile 拼接观感稳定）
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  // 曼哈顿走线
  for (let t = 0; t < 10; t++) {
    ctx.strokeStyle = `rgba(180,83,9,${0.08 + rnd() * 0.08})`;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    let x = Math.floor(rnd() * 8) * 64;
    let y = Math.floor(rnd() * 8) * 64;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      if (rnd() > 0.5) x += (rnd() > 0.5 ? 1 : -1) * 64 * (1 + Math.floor(rnd() * 2));
      else y += (rnd() > 0.5 ? 1 : -1) * 64 * (1 + Math.floor(rnd() * 2));
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    // 过孔
    ctx.fillStyle = "rgba(180,83,9,0.20)";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e9e1cd";
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 丝印小字
  ctx.fillStyle = "rgba(35,43,54,0.12)";
  ctx.font = `600 11px ${MONO}`;
  ctx.fillText("SZF-2026 REV.A", 20, 30);
  ctx.fillText("AI × HUMAN", 330, 480);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
