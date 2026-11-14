import type { CSSProperties, ReactNode } from "react";
import { ArrowRight, BadgeCheck, Clock, Lock, ScanLine, ShieldCheck } from "lucide-react";
import { useT } from "@/lib/prefs";
import { tx } from "@/lib/dict";
import { jobPrices, JOB_KEYS, problems } from "@/data/demo";
import { SplitWords, usePointerTilt } from "./motion";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function Hero() {
  const { t, lang } = useT();
  const ac = problems[0]!;
  const tiltRef = usePointerTilt<HTMLElement>();
  const firstWords = t.hero.title1.split(" ").length;
  return (
    <section id="top" ref={tiltRef} className="relative overflow-hidden pt-28 sm:pt-36">
      <div className="pattern-layer opacity-50" aria-hidden />
      {/* soft brand glow behind the phone */}
      <div
        className="pointer-events-none absolute -end-40 top-10 size-[44rem] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_14%,transparent),transparent)]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:pb-24">
        <div className="text-center lg:text-start">
          <p className="intro label-mono inline-flex items-center gap-2 text-muted-foreground" style={d(0)}>
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            {t.brand.tagline}
          </p>
          <h1 key={lang} className="display-tight mt-6 text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-[4.6rem]">
            <SplitWords text={t.hero.title1} delay={120} />{" "}
            <SplitWords text={t.hero.title2} delay={120 + firstWords * 45 + 60} />
          </h1>
          <p className="intro mx-auto mt-7 max-w-xl text-lg text-muted-foreground lg:mx-0" style={d(560)}>{t.hero.sub}</p>
          <div className="intro mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start" style={d(660)}>
            <a href="#demo" className="btn btn-primary px-6 text-base">{t.hero.cta1}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden /></a>
            <a href="#how" className="btn btn-ghost px-6 text-base">{t.hero.cta2}</a>
          </div>
        </div>

        <div className="intro-phone relative mx-auto w-full max-w-[300px] sm:max-w-[340px]" style={d(150)}>
          {/* phone */}
          <div className="tilt-phone relative rounded-[2.8rem] border-[10px] border-ink bg-ink p-0 shadow-[var(--shadow-lift)]">
            <div className="absolute start-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink rtl:translate-x-1/2" aria-hidden />
            <div className="relative overflow-hidden rounded-[2.1rem] bg-background">
              <div className="relative h-64 overflow-hidden" style={{ "--scan-h": "16rem" } as CSSProperties}>
                <img src={ac.image} alt="Wall-mounted AC unit with water staining underneath" width={768} height={1024} fetchPriority="high" className="hero-img size-full object-cover" />
                <div className="scan-line hero-scan" aria-hidden />
                <span className="label-mono absolute start-3 top-8 inline-flex items-center gap-1.5 rounded-full glass px-2.5 py-1 text-foreground">
                  <ScanLine className="size-3 text-brand-text" aria-hidden />{t.hero.phoneScan}
                </span>
              </div>
              <div className="intro -mt-6 relative space-y-3 rounded-t-3xl bg-card p-5" style={d(1500)}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display text-lg font-bold leading-tight">{tx(ac.diagnosis, lang)}</p>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-today/15 px-2.5 py-1 text-xs font-semibold text-today"><Clock className="size-3" aria-hidden />{t.hero.urgency}</span>
                </div>
                <div className="rounded-2xl bg-secondary p-3">
                  <p className="text-xs text-muted-foreground">{t.hero.fair}</p>
                  <p className="font-display text-2xl font-bold tabular-nums" dir="ltr">{ac.priceMin}–{ac.priceMax} <span className="text-sm font-semibold text-muted-foreground">QAR</span></p>
                </div>
                <div className="btn btn-primary w-full text-sm">{t.hero.book}</div>
              </div>
              <div className="phone-glare" aria-hidden />
            </div>
          </div>
          {/* floating UI cards: pop in after the scan, then drift with the pointer at different depths */}
          <Float className="-end-3 top-16 sm:-end-16" delay={1900} depth={34} icon={<BadgeCheck className="size-4" />} text={t.hero.float1} cap={t.hero.floatCap1} />
          <Float className="-start-3 top-44 sm:-start-20" delay={2050} depth={-26} icon={<Lock className="size-4" />} text={t.hero.float2} cap={t.hero.floatCap2} />
          <Float className="-end-3 -bottom-6 sm:-end-14" delay={2200} depth={20} icon={<ShieldCheck className="size-4" />} text={t.hero.float3} cap={t.hero.floatCap3} />
        </div>
      </div>
      <PriceStrip />
    </section>
  );
}

function Float({ className, icon, text, cap, delay, depth }: { className: string; icon: ReactNode; text: string; cap: string; delay: number; depth: number }) {
  return (
    <div
      className={`float-card absolute flex items-center gap-2.5 rounded-2xl border border-border bg-card/95 py-2 ps-2 pe-3.5 shadow-[var(--shadow-lift)] backdrop-blur ${className}`}
      style={{ "--d": `${delay}ms`, "--depth": depth } as CSSProperties}
      aria-hidden
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">{icon}</span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">{text}</span>
        <span className="label-mono block text-[0.66rem] text-muted-foreground">{cap}</span>
      </span>
    </div>
  );
}

/** A band of sample prices from the job table in demo.ts. It slides as the page scrolls. */
function PriceStrip() {
  const { t, lang } = useT();
  return (
    <div className="relative border-y border-border bg-secondary/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-8">
        <p className="label-mono shrink-0 text-brand-text">{t.hero.priceStrip}</p>
        <div className="price-viewport relative w-full min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <ul className="price-track flex w-max gap-10" aria-label={t.hero.priceStrip}>
            {JOB_KEYS.map((k) => (
              <li key={k} className="label-mono flex items-baseline gap-2.5 whitespace-nowrap text-muted-foreground">
                <span>{tx(jobPrices[k].label, lang)}</span>
                <span className="text-foreground tabular-nums" dir="ltr">{jobPrices[k].min}–{jobPrices[k].max} QAR</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
