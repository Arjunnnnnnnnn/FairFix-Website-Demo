import type { CSSProperties, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Clock, Lock, Mic } from "lucide-react";
import { usePrefs, useT } from "@/lib/prefs";
import { LANGS, langInfo } from "@/lib/langs";
import { tx } from "@/lib/dict";
import { jobPrices, problems, technicians } from "@/data/demo";
import { QrCode } from "./QrCode";
import { Heading, Section } from "./Section";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;


/**
 * Bento grid that shows pieces of the product instead of icon cards.
 * 6 columns on desktop, 2 on tablet, 1 on phones.
 */
export function Features() {
  const { t, lang } = useT();
  const f = t.features.items;
  const ac = problems[0]!;
  const gas = jobPrices.ac_gas_refill;
  const tech = technicians.ac;
  const nf = new Intl.NumberFormat(langInfo(lang).intl);
  const { setLang } = usePrefs();
  const urgency = [
    { key: "safe" as const, cls: "bg-safe/15 text-safe", Icon: CheckCircle2 },
    { key: "today" as const, cls: "bg-today/15 text-today", Icon: Clock },
    { key: "danger" as const, cls: "bg-danger/15 text-danger", Icon: AlertTriangle },
  ];

  return (
    <Section id="features">
      <Heading index="04" eyebrow={t.features.eyebrow} title={t.features.title} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {/* AI photo diagnosis */}
        <Tile className="md:col-span-2 lg:col-span-4" delay={0} title={f[0]!.t} desc={f[0]!.d}>
          <div className="relative grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:items-center">
            <div className="relative h-44 overflow-hidden rounded-xl">
              <img src={ac.image} alt="" width={768} height={1024} loading="lazy" className="size-full object-cover" />
              <div className="absolute inset-x-[14%] top-[18%] h-[38%] rounded-lg border-2 border-dashed border-primary-foreground/90" aria-hidden />
              <div className="absolute inset-x-0 top-[46%] h-0.5 bg-accent shadow-[0_0_18px_4px_color-mix(in_oklab,var(--accent)_55%,transparent)]" aria-hidden />
            </div>
            <div className="space-y-2.5">
              <p className="label-mono text-muted-foreground">{t.demo.diagnosis} · <span className="tabular-nums">{ac.confidence}%</span></p>
              <p className="font-display text-xl font-bold leading-tight">{tx(ac.diagnosis, lang)}</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-today/15 px-2.5 py-1 text-xs font-semibold text-today">
                <Clock className="size-3.5" aria-hidden />{t.demo.urgency.today}
              </span>
            </div>
          </div>
        </Tile>

        {/* Urgency rating */}
        <Tile className="lg:col-span-2" delay={90} title={f[1]!.t} desc={f[1]!.d}>
          <ul className="flex flex-col items-start gap-2">
            {urgency.map(({ key, cls, Icon }) => (
              <li key={key} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${cls}`}>
                <Icon className="size-4" aria-hidden />{t.demo.urgency[key]}
              </li>
            ))}
          </ul>
        </Tile>

        {/* Fair price ranges */}
        <Tile className="lg:col-span-2" delay={0} title={f[2]!.t} desc={f[2]!.d}>
          <p className="text-sm font-semibold">{tx(gas.label, lang)}</p>
          <div className="mt-4" dir="ltr">
            {/* track runs 0–500 QAR; the filled part is the real sample range */}
            <div className="relative h-2 rounded-full bg-border">
              <div className="absolute inset-y-0 rounded-full bg-primary" style={{ left: `${(gas.min / 500) * 100}%`, right: `${100 - (gas.max / 500) * 100}%` }} />
            </div>
            <div className="mt-2 flex justify-between label-mono text-muted-foreground tabular-nums">
              <span>0</span>
              <span className="text-foreground">{gas.min}–{gas.max} QAR</span>
              <span>500</span>
            </div>
          </div>
          <p className="label-mono mt-2 text-muted-foreground">{t.pricing.sample}</p>
        </Tile>

        {/* Locked quotes + QR identity check */}
        <Tile className="lg:col-span-2" delay={90} title={f[4]!.t} desc={f[4]!.d} extra={{ t: f[3]!.t, d: f[3]!.d }}>
          <div className="flex items-center gap-4">
            <QrCode seed={tech.id} size={76} label={`${t.a11y.qr} ${tech.name}`} />
            <div className="min-w-0">
              <p className="font-display font-bold" translate="no">{tech.name}</p>
              <p className="label-mono truncate text-muted-foreground" translate="no">{tech.licence.split(" ").pop()}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                <Lock className="size-3" aria-hidden />{t.hero.float2}
              </span>
            </div>
          </div>
        </Tile>

        {/* Languages + voice */}
        <Tile className="lg:col-span-2" delay={180} title={f[5]!.t} desc={f[5]!.d}>
          {/* Each chip switches the whole site to that language; the voice chip opens the demo. */}
          <ul className="flex flex-wrap gap-2" translate="no" aria-label={t.features.tapLang}>
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button" lang={l.code} onClick={() => setLang(l.code)} aria-pressed={lang === l.code}
                  className={`min-h-9 rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    lang === l.code ? "border-primary bg-primary/10 text-brand-text" : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  {l.name}
                </button>
              </li>
            ))}
            <li>
              <a href="#demo" className="inline-flex min-h-9 items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                <Mic className="size-3.5" aria-hidden />{t.features.voice}
              </a>
            </li>
          </ul>
          <p className="label-mono mt-3 text-muted-foreground">{t.features.tapLang}</p>
        </Tile>

        {/* Guarantee + dispute trail */}
        <Tile className="md:col-span-2 lg:col-span-4" delay={0} title={f[7]!.t} desc={f[7]!.d} extra={{ t: f[8]!.t, d: f[8]!.d }}>
          <ol className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-4">
            {t.features.timeline.map((step, i) => (
              <li key={step} className="relative">
                <div className={`h-1 rounded-full ${i < 3 ? "bg-primary" : "bg-primary/35"}`} aria-hidden />
                <p className="label-mono mt-2 text-brand-text tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-0.5 text-sm font-semibold leading-snug">{step}</p>
              </li>
            ))}
          </ol>
        </Tile>

        {/* AC Care Plans: two pre-summer service months */}
        <Tile className="lg:col-span-2" delay={90} title={f[6]!.t} desc={f[6]!.d}>
          <p className="label-mono mb-2 text-muted-foreground">{t.features.visits}</p>
          <ol className="grid grid-cols-6 gap-1.5" aria-hidden>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <li
                key={m}
                className={`grid h-8 place-items-center rounded-md text-xs font-semibold tabular-nums ${
                  m === 3 || m === 5 ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                }`}
              >
                {nf.format(m)}
              </li>
            ))}
          </ol>
        </Tile>
      </div>
    </Section>
  );
}

function Tile({
  className, delay, title, desc, extra, children,
}: { className: string; delay: number; title: string; desc: string; extra?: { t: string; d: string }; children: ReactNode }) {
  return (
    <article className={`reveal spotlight card-premium hover-lift flex flex-col gap-4 p-5 sm:gap-5 sm:p-6 ${className}`} style={d(delay)}>
      <div className="rounded-2xl bg-secondary/70 p-4">{children}</div>
      <div className="mt-auto space-y-3">
        <div>
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
        {extra && (
          <div className="border-t border-border pt-3">
            <h3 className="font-display text-base font-bold">{extra.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{extra.d}</p>
          </div>
        )}
      </div>
    </article>
  );
}
