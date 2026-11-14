import { Fragment, type ReactNode } from "react";
import { useReveal } from "@/lib/prefs";

export function Section({ id, ink, children, className = "" }: { id?: string; ink?: boolean; children: ReactNode; className?: string }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section id={id} ref={ref} className={`relative overflow-hidden py-16 sm:py-28 ${ink ? "section-ink" : ""} ${className}`}>
      <div className="pattern-layer opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">{children}</div>
    </section>
  );
}

/** Renders copy where `*words*` are set in the serif accent (colour only in Arabic). */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <em key={i} className="accent-serif">{part.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Small mono label with a section number and a hairline rule, e.g. "02  HOW IT WORKS ────". */
export function SectionLabel({ index, children, ink }: { index?: string | undefined; children: ReactNode; ink?: boolean | undefined }) {
  return (
    <p className={`label-mono flex items-center gap-3 ${ink ? "text-ink-muted" : "text-muted-foreground"}`}>
      {index && <span className="tabular-nums text-brand-text">{index}</span>}
      <span>{children}</span>
      <span className={`h-px flex-1 ${ink ? "bg-ink-border" : "bg-border"}`} aria-hidden />
    </p>
  );
}

/** Editorial section heading: numbered label, large left-aligned title, supporting line beside it on desktop. */
export function Heading({ index, eyebrow, title, sub, ink }: { index?: string; eyebrow: string; title: string; sub?: string; ink?: boolean }) {
  return (
    <div className="reveal mb-12 sm:mb-16">
      <SectionLabel index={index} ink={ink}>{eyebrow}</SectionLabel>
      <div className="mt-6 grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
        <h2 className="display-tight text-4xl font-bold leading-[1.04] sm:text-5xl lg:col-span-7 lg:text-[3.5rem]">
          <Rich text={title} />
        </h2>
        {sub && <p className={`text-lg lg:col-span-5 lg:pb-1.5 ${ink ? "text-ink-muted" : "text-muted-foreground"}`}>{sub}</p>}
      </div>
    </div>
  );
}
