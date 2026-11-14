import { Fragment, useEffect, useRef, useState } from "react";

/** True when the visitor asked the OS to reduce motion. Client-only. */
function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True on devices with a precise pointer that can hover (mouse/trackpad). Client-only. */
function hasFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * Renders text as words that rise out of a mask one after another.
 * Spaces stay outside the masks so line breaking and screen readers behave normally.
 */
export function SplitWords({ text, delay = 0, step = 45 }: { text: string; delay?: number; step?: number }) {
  // `*words*` are set in the serif accent, matching <Rich>.
  let inAccent = false;
  const words = text.split(" ").map((raw) => {
    let w = raw;
    if (w.startsWith("*")) { inAccent = true; w = w.slice(1); }
    const closes = w.endsWith("*");
    if (closes) w = w.slice(0, -1);
    const accent = inAccent;
    if (closes) inAccent = false;
    return { w, accent };
  });
  return (
    <>
      {words.map(({ w, accent }, i) => (
        <Fragment key={`${i}-${w}`}>
          <span className={`word-mask ${accent ? "word-mask--em" : ""}`}>
            <span className={`word-rise ${accent ? "accent-serif" : ""}`} style={{ animationDelay: `${delay + i * step}ms` }}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

/**
 * Tracks the pointer over an element and exposes its position as --tx / --ty
 * (each from -0.5 to 0.5) for CSS tilt and parallax. Desktop pointers only.
 */
export function usePointerTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !hasFinePointer()) return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      if (!last) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--tx", ((last.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty("--ty", ((last.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      last = null;
      el.style.setProperty("--tx", "0");
      el.style.setProperty("--ty", "0");
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return ref;
}

/** Moves the glow inside any `.spotlight` element to follow the pointer. Desktop pointers only. */
export function useSpotlight() {
  useEffect(() => {
    if (prefersReducedMotion() || !hasFinePointer()) return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const target = last?.target;
      if (!last || !(target instanceof Element)) return;
      const card = target.closest<HTMLElement>(".spotlight");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${last.clientX - r.left}px`);
      card.style.setProperty("--my", `${last.clientY - r.top}px`);
    };
    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
    };
  }, []);
}

/**
 * Counts to `to` with an ease-out, starting from the value currently shown, so later changes
 * animate from the old number to the new one. With `fromZero={false}` the first render shows
 * `to` directly (use this for server-rendered numbers so the page never flashes 0).
 * Reserves its final width so text doesn't shift.
 */
export function CountUp({ to, duration = 700, fromZero = true }: { to: number; duration?: number; fromZero?: boolean }) {
  const [value, setValue] = useState(() => (fromZero && !prefersReducedMotion() ? 0 : to));
  const shown = useRef(value);
  useEffect(() => {
    shown.current = value;
  }, [value]);
  useEffect(() => {
    const from = shown.current;
    if (from === to) return;
    if (prefersReducedMotion()) {
      setValue(to);
      return;
    }
    let raf = 0;
    // Time from the first frame: in background tabs a frame's timestamp can be earlier than performance.now().
    let start: number | null = null;
    const tick = (now: number) => {
      start ??= now;
      const p = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return (
    <span className="inline-block text-end" style={{ minWidth: `${String(to).length}ch` }}>
      {value}
    </span>
  );
}
