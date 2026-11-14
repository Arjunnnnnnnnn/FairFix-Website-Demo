/**
 * All six languages in one place. English and Arabic live in i18n.ts; Hindi, Urdu, Malayalam
 * and Tagalog live in ./locales. Any language that isn't translated yet falls back to English.
 */
import type { L } from "@/data/demo";
import { ar, en, type Dict } from "./i18n";
import type { Lang } from "./langs";
import { hi, hiData } from "./locales/hi";
import { ml, mlData } from "./locales/ml";
import { tl, tlData } from "./locales/tl";
import { ur, urData } from "./locales/ur";

export const dict: Record<Lang, Dict> = { en, ar, hi: hi ?? en, ur: ur ?? en, ml: ml ?? en, tl: tl ?? en };

/**
 * Data labels (plans, job types, areas, sample problems) are written as { en, ar } in src/data.
 * The other languages translate them through a lookup keyed by the English text.
 */
const DATA: Record<Exclude<Lang, "en" | "ar">, Record<string, string>> = { hi: hiData, ur: urData, ml: mlData, tl: tlData };

export function tx(l: L, lang: Lang): string;
export function tx(l: L | undefined, lang: Lang): string | undefined;
export function tx(l: L | undefined, lang: Lang): string | undefined {
  if (!l) return undefined;
  if (lang === "en" || lang === "ar") return l[lang];
  return DATA[lang][l.en] ?? l.en;
}
