/**
 * 输入单例：键盘 + 虚拟摇杆共用一份状态，Car 每帧读取。
 */
export const input = {
  up: false,
  down: false,
  left: false,
  right: false,
  boost: false,
  resetRequested: false,
  // 摇杆模拟量（-1..1），touch 时生效
  joyX: 0,
  joyY: 0,
  joyActive: false,
};

/** 归一化后的油门（-1 后退 .. 1 前进）与转向（-1 左 .. 1 右） */
export function readAxis(): { throttle: number; steer: number } {
  if (input.joyActive) {
    return { throttle: -input.joyY, steer: input.joyX };
  }
  const throttle = (input.up ? 1 : 0) - (input.down ? 1 : 0);
  const steer = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  return { throttle, steer };
}

const KEYMAP: Record<string, keyof typeof input | "reset"> = {
  KeyW: "up",
  ArrowUp: "up",
  KeyS: "down",
  ArrowDown: "down",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "boost",
  ShiftRight: "boost",
  KeyR: "reset",
};

export function attachKeyboard(): () => void {
  const onKey = (down: boolean) => (e: KeyboardEvent) => {
    const target = KEYMAP[e.code];
    if (!target) return;
    // 别吃掉浏览器快捷键 / 输入框
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (target === "reset") {
      if (down) input.resetRequested = true;
      return;
    }
    (input[target] as boolean) = down;
    if (e.code.startsWith("Arrow")) e.preventDefault();
  };
  const keydown = onKey(true);
  const keyup = onKey(false);
  window.addEventListener("keydown", keydown);
  window.addEventListener("keyup", keyup);
  const onBlur = () => {
    input.up = input.down = input.left = input.right = input.boost = false;
  };
  window.addEventListener("blur", onBlur);
  return () => {
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
    window.removeEventListener("blur", onBlur);
  };
}
