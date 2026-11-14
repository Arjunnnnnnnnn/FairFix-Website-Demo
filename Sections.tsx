import {
  Building2, Camera, Check, Coins, Github, Instagram, Linkedin, Mail, Minus, QrCode as QrIcon, ScanSearch, Wrench, X,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { CSSProperties } from "react";
import { useReveal, useT } from "@/lib/prefs";
import { useAccount } from "@/lib/account";
import { APP_NAME, APP_NAME_AR, TEAM, pricing } from "@/data/demo";
import { Heading, Rich, Section, SectionLabel } from "./Section";
import { Logo } from "./Nav";

/** Sets the stagger delay that `.reveal` reads. */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
const num = (i: number) => String(i + 1).padStart(2, "0");

export function Problem() {
  const { t } = useT();
  return (
    <Section>
      <Heading index="01" eyebrow={t.problem.eyebrow} title={t.problem.title} sub={t.problem.sub} />
      <ol className="border-t border-border">
        {t.problem.cards.map((c, i) => (
          <li key={c.t} className="reveal group grid gap-3 border-b border-border py-8 md:grid-cols-12 md:items-baseline md:gap-8" style={d(i * 90)}>
            <span className="label-mono text-brand-text md:col-span-1">{num(i)}</span>
            <h3 className="display-tight text-2xl font-bold transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 sm:text-[2rem] md:col-span-6">{c.t}</h3>
            <p className="text-muted-foreground md:col-span-5">{c.d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function HowItWorks() {
  const { t } = useT();
  const icons = [Camera, ScanSearch, Coins, Wrench, QrIcon];
  return (
    <Section id="how" className="bg-secondary/50">
      <Heading index="02" eyebrow={t.how.eyebrow} title={t.how.title} />
      <ol className="relative grid gap-6 md:grid-cols-5">
        <li role="presentation" aria-hidden className="absolute inset-x-[10%] top-7 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
        <li role="presentation" aria-hidden className="draw-x absolute inset-x-[10%] top-[27px] hidden h-[2px] rounded-full bg-primary md:block" />
        {t.how.steps.map((s, i) => {
          const I = icons[i % icons.length] ?? icons[0];
          if (!I) return null;
          return (
            <li key={s.t} className="reveal relative flex gap-4 md:flex-col md:items-center md:text-center" style={d(200 + i * 260)}>
              <span className="step-icon relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl bg-maroon-gradient text-primary-foreground shadow-[var(--shadow-soft)]"><I className="size-6" aria-hidden /></span>
              <div>
                <p className="label-mono text-brand-text">{num(i)}</p>
                <h3 className="mt-1 text-lg font-bold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

type Cell = "y" | "n" | "p";
const matrix: [Cell, Cell, Cell][] = [
  ["y", "p", "y"], ["n", "p", "y"], ["n", "n", "y"], ["n", "n", "y"], ["n", "n", "y"], ["n", "n", "y"], ["y", "p", "y"],
];

export function Compare() {
  const { t, lang } = useT();
  const mark = (c: Cell | undefined) =>
    c === "y" ? <span className="inline-flex items-center gap-1 text-ink-foreground"><Check className="size-5" aria-hidden /><span className="sr-only">{t.compare.yes}</span></span>
    : c === "n" ? <span className="inline-flex text-ink-muted"><X className="size-5" aria-hidden /><span className="sr-only">{t.compare.no}</span></span>
    : <span className="inline-flex flex-col items-center gap-0.5 text-xs text-ink-foreground sm:flex-row sm:gap-1"><Minus className="size-5" aria-hidden />{t.compare.partial}</span>;
  return (
    <Section ink>
      <Heading index="05" ink eyebrow={t.compare.eyebrow} title={t.compare.title} sub={t.compare.sub} />
      {/* Fits a phone screen without sideways scrolling, so the FairFix column is always visible. */}
      <div className="reveal overflow-x-auto rounded-3xl border border-ink-border">
        <table className="w-full text-sm sm:min-w-[560px] sm:text-base">
          <thead>
            <tr className="border-b border-ink-border">
              <th scope="col" className="w-[38%] p-3 text-start font-medium text-ink-muted sm:w-auto sm:p-4"><span className="sr-only">{t.a11y.feature}</span></th>
              {t.compare.cols.map((c) => <th key={c} scope="col" className="label-mono px-1.5 py-3 text-center align-bottom text-ink-muted sm:p-4">{c}</th>)}
              <th scope="col" className="bg-primary text-primary-foreground px-1.5 py-3 text-center align-bottom font-display font-bold sm:p-4" translate="no">{lang === "ar" ? APP_NAME_AR : APP_NAME}</th>
            </tr>
          </thead>
          <tbody>
            {t.compare.rows.map((r, i) => (
              <tr key={r} className="border-b border-ink-border last:border-0">
                <th scope="row" className="p-3 text-start font-medium sm:p-4">{r}</th>
                <td className="px-1.5 py-3 text-center sm:p-4">{mark(matrix[i]?.[0])}</td>
                <td className="px-1.5 py-3 text-center sm:p-4">{mark(matrix[i]?.[1])}</td>
                <td className="bg-primary text-primary-foreground px-1.5 py-3 text-center sm:p-4">{mark(matrix[i]?.[2])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export function Technicians() {
  const { t } = useT();
  return (
    <Section id="technicians" className="bg-secondary/50">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="reveal lg:col-span-5">
          <SectionLabel index="07">{t.techs.eyebrow}</SectionLabel>
          <h2 className="display-tight mt-6 text-4xl font-bold leading-[1.04] sm:text-5xl"><Rich text={t.techs.title} /></h2>
          <p className="mt-5 text-lg text-muted-foreground">{t.techs.sub}</p>
          <div className="mt-7 inline-flex items-baseline gap-2 rounded-2xl border border-border bg-card px-4 py-3">
            <span className="text-sm text-muted-foreground">{t.techs.price}</span>
            <span className="font-display text-xl font-bold tabular-nums" dir="ltr">{pricing.partnerMonthly} QAR</span>
            <span className="label-mono text-muted-foreground">{t.techs.sample}</span>
          </div>
          <div className="mt-6"><a href="/signup/business?type=partner" className="btn btn-primary">{t.techs.cta}</a></div>
        </div>
        <ol className="border-t border-border lg:col-span-7 lg:mt-12">
          {t.techs.items.map((it, i) => (
            <li key={it.t} className="reveal grid grid-cols-[3rem_1fr] gap-x-4 border-b border-border py-6" style={d(i * 90)}>
              <span className="label-mono pt-1.5 text-brand-text">{num(i)}</span>
              <div>
                <h3 className="font-display text-xl font-bold">{it.t}</h3>
                <p className="mt-1 text-muted-foreground">{it.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

export function Vision() {
  const { t } = useT();
  const ref = useReveal<HTMLElement>();
  return (
    <section
      id="vision"
      ref={ref}
      className="relative overflow-hidden bg-maroon-gradient py-20 text-primary-foreground [--brand-text:var(--primary-foreground)] sm:py-28"
    >
      <div className="pattern-layer [--pattern-color:oklch(1_0_0/8%)]" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <div className="reveal mb-14">
          <p className="label-mono flex items-center gap-3 text-primary-foreground/80">
            <span className="tabular-nums text-primary-foreground">08</span>
            <span>{t.vision.eyebrow}</span>
            <span className="h-px flex-1 bg-primary-foreground/25" aria-hidden />
          </p>
          <h2 className="display-tight mt-6 max-w-3xl text-4xl font-bold leading-[1.04] sm:text-5xl lg:text-[3.5rem]"><Rich text={t.vision.title} /></h2>
        </div>
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {t.vision.items.map((v, i) => (
            <li key={v.t} className="reveal border-t border-primary-foreground/30 pt-6" style={d(i * 90)}>
              <p className="label-mono text-primary-foreground/70">{num(i)}</p>
              <h3 className="mt-3 font-display text-xl font-bold">{v.t}</h3>
              <p className="mt-2 text-sm opacity-85">{v.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Roadmap() {
  const { t } = useT();
  return (
    <Section>
      <Heading index="09" eyebrow={t.roadmap.eyebrow} title={t.roadmap.title} sub={t.roadmap.note} />
      <ol className="roadmap-track relative max-w-2xl border-s-2 border-primary/25 ps-8 lg:ms-[8.33%]">
        {t.roadmap.items.map((r, i) => (
          <li key={r.t} className="reveal relative pb-10 last:pb-0">
            <span className={`absolute -start-[43px] top-0 grid size-6 place-items-center rounded-full border-4 border-background ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} aria-hidden />
            <span className={`label-mono rounded-full px-2.5 py-0.5 ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{r.s}</span>
            <h3 className="mt-2 font-display text-xl font-bold">{r.t}</h3>
            <p className="text-muted-foreground">{r.d}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Faq() {
  const { t } = useT();
  return (
    <Section className="bg-secondary/50">
      <Heading index="10" eyebrow={t.faq.eyebrow} title={t.faq.title} />
      <Accordion type="single" collapsible className="reveal max-w-3xl space-y-3 lg:ms-[8.33%]">
        {t.faq.items.map((f, i) => (
          <AccordionItem key={f.q} value={`q${i}`} className="card-premium border px-5">
            <AccordionTrigger className="text-start font-display text-base font-semibold hover:no-underline">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}

export function FinalCta() {
  const { t } = useT();
  const { account, loaded } = useAccount();
  return (
    <section id="contact" className="px-5 py-16 sm:px-8">
      <div className="spotlight spotlight-lg relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] section-ink p-10 text-center sm:p-16">
        <div className="pattern-layer" aria-hidden />
        <div className="absolute -bottom-32 start-1/2 size-96 -translate-x-1/2 rounded-full bg-primary/40 blur-3xl" aria-hidden />
        <div className="relative">
          <h2 className="display-tight mx-auto max-w-3xl text-4xl font-bold leading-[1.04] sm:text-6xl"><Rich text={t.cta.title} /></h2>
          <p className="mt-5 text-ink-muted">{t.cta.sub}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="#demo" className="btn btn-primary px-7 text-base">{t.cta.btn}</a>
            {loaded && !account && <a href="/signup" className="btn btn-ink-ghost px-7 text-base">{t.cta.signup}</a>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  const { t } = useT();
  const socials = [[Instagram, "Instagram"], [Linkedin, "LinkedIn"], [Github, "GitHub"], [Mail, "Email"]] as const;
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 text-center sm:px-8 md:flex-row md:text-start">
        <div>
          <Logo />
          <p className="label-mono mt-3 text-brand-text">{t.brand.tagline}</p>
          <p className="mt-2 text-sm text-muted-foreground"><span translate="no" dir="ltr">{TEAM.name}</span> · {TEAM.school}</p>
          <p className="text-xs text-muted-foreground">{TEAM.hackathon}</p>
        </div>
        <div className="flex flex-col items-center gap-3 md:items-end">
          <div className="flex gap-2">
            {socials.map(([I, l]) => (
              <a key={l} href="#top" aria-label={l} className="grid size-11 place-items-center rounded-full border border-border transition-colors hover:bg-secondary hover:text-brand-text"><I className="size-4" /></a>
            ))}
          </div>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="size-3.5" aria-hidden />{t.footer.made} · {t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
