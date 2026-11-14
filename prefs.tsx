import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Dict } from "./i18n";
import { dict } from "./dict";
import { detectLang, isLang, isRtl, type Lang } from "./langs";

/** Match --background in src/styles.css (light / dark). */
export const THEME_LIGHT = "#FCF5E5";
export const THEME_DARK = "#151413";

type Prefs = { lang: Lang; setLang: (l: Lang) => void; dark: boolean; setDark: (d: boolean) => void };
const Ctx = createContext<Prefs | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const [dark, setDark] = useState(false);
  // Don't save until the saved choices are loaded; otherwise the first render's defaults
  // overwrite them (React's dev StrictMode runs effects twice, which made this lose every time).
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // A saved choice wins; otherwise use the phone's language if it's one of ours.
    const l = localStorage.getItem("lang");
    const detected = detectLang(navigator.languages ?? [navigator.language]);
    if (isLang(l)) setLang(l);
    else if (detected) setLang(detected);
    const d = localStorage.getItem("dark");
    setDark(d ? d === "1" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    setLoaded(true);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl(lang) ? "rtl" : "ltr";
    if (loaded) localStorage.setItem("lang", lang);
  }, [lang, loaded]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? THEME_DARK : THEME_LIGHT);
    if (loaded) localStorage.setItem("dark", dark ? "1" : "0");
  }, [dark, loaded]);
  return <Ctx.Provider value={{ lang, setLang, dark, setDark }}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const c = useContext(Ctx);
  if (!c) throw new Error("PrefsProvider missing");
  return c;
}
export function useT() {
  const { lang } = usePrefs();
  return { t: dict[lang], lang };
}

/** Keeps the tab title in the current language. Each page passes its own title. */
export function usePageTitle(pick: (t: Dict) => string) {
  const { t } = useT();
  const title = pick(t);
  useEffect(() => {
    document.title = title;
  }, [title]);
}

/** Adds .is-visible to `.reveal` and `.draw-x` elements when they scroll into view. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("is-visible"), io.unobserve(e.target))),
      { threshold: 0.12 },
    );
    el.querySelectorAll(".reveal, .draw-x").forEach((n) => io.observe(n));
    if (el.matches(".reveal, .draw-x")) io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
