/**
 * The six languages FairFix supports. Arabic and Urdu read right to left.
 * `speech` is the code for voice input (Web Speech API); `intl` formats numbers and dates;
 * `english` is how the AI prompt names the language it must answer in.
 */
export const LANGS = [
  { code: "en", name: "English", english: "English", dir: "ltr", speech: "en-US", intl: "en" },
  { code: "ar", name: "العربية", english: "Arabic", dir: "rtl", speech: "ar-QA", intl: "ar-QA" },
  { code: "hi", name: "हिन्दी", english: "Hindi", dir: "ltr", speech: "hi-IN", intl: "hi-IN" },
  { code: "ur", name: "اردو", english: "Urdu", dir: "rtl", speech: "ur-PK", intl: "ur-PK" },
  { code: "ml", name: "മലയാളം", english: "Malayalam", dir: "ltr", speech: "ml-IN", intl: "ml-IN" },
  { code: "tl", name: "Tagalog", english: "Tagalog (Filipino)", dir: "ltr", speech: "fil-PH", intl: "fil-PH" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];
export type LangInfo = (typeof LANGS)[number];

export const LANG_CODES = LANGS.map((l) => l.code) as Lang[];
export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANG_CODES as string[]).includes(v);
export const langInfo = (l: Lang): LangInfo => LANGS.find((x) => x.code === l) ?? LANGS[0];
export const isRtl = (l: Lang) => langInfo(l).dir === "rtl";

/** Best match for the visitor's phone or browser language, e.g. "fil-PH" → "tl", "ar-QA" → "ar". */
export function detectLang(preferred: readonly string[]): Lang | null {
  for (const tag of preferred) {
    const base = tag.toLowerCase().split("-")[0];
    if (base === "fil") return "tl";
    if (isLang(base)) return base;
  }
  return null;
}
