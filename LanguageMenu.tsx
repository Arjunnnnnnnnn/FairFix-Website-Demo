import { Check, Languages } from "lucide-react";
import { usePrefs, useT } from "@/lib/prefs";
import { LANGS, isRtl, type Lang } from "@/lib/langs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Short code on the button, in each language's own script where that reads better. */
const SHORT: Record<Lang, string> = { en: "EN", ar: "ع", hi: "हि", ur: "اُر", ml: "മ", tl: "TL" };

/** Language picker for the nav and the sign-up pages. Names are shown in their own script. */
export function LanguageMenu() {
  const { t, lang } = useT();
  const { setLang } = usePrefs();
  return (
    <DropdownMenu dir={isRtl(lang) ? "rtl" : "ltr"} modal={false}>
      <DropdownMenuTrigger
        aria-label={t.nav.lang}
        className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 text-sm font-semibold transition-colors hover:bg-secondary data-[state=open]:bg-secondary"
      >
        <Languages className="size-4" aria-hidden />
        <span translate="no">{SHORT[lang]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-2xl border-border bg-card p-1.5 text-card-foreground shadow-[var(--shadow-lift)]">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            lang={l.code}
            dir={l.dir}
            onSelect={() => setLang(l.code)}
            aria-current={l.code === lang ? "true" : undefined}
            className="min-h-11 cursor-pointer justify-between gap-3 rounded-xl px-3 text-base focus:bg-secondary focus:text-foreground"
          >
            <span translate="no">{l.name}</span>
            {l.code === lang ? (
              <Check className="size-4 text-brand-text" aria-hidden />
            ) : (
              <span className="label-mono text-muted-foreground" lang="en" dir="ltr">{l.english.split(" ")[0]}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
