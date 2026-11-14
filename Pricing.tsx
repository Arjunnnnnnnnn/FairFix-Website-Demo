import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Building2, Check, Minus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useT } from "@/lib/prefs";
import { tx } from "@/lib/dict";
import { businessPlan, DEFAULT_BILLING, planComparison, plans, type Billing, type CompareCell, type Plan, type PlanId } from "@/data/pricing";
import { CountUp } from "./motion";
import { Heading, Section } from "./Section";

/** Sets the stagger delay that `.reveal` reads. */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** Order on phones: the popular plan first (it also gets `order-first` in the swipe row). */
const PHONE_ORDER = [...plans].sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)));

export function Pricing() {
  const { t, lang } = useT();
  const [billing, setBilling] = useState<Billing>(DEFAULT_BILLING);
  const rowRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<PlanId>(PHONE_ORDER[0]!.id);

  // Phones: track which plan card is centred in the swipe row, for the dots.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.getAttribute("data-plan") as PlanId)),
      { root: row, threshold: 0.6 },
    );
    row.querySelectorAll("[data-plan]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const show = (id: PlanId) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rowRef.current?.querySelector(`[data-plan="${id}"]`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", inline: "center", block: "nearest" });
  };

  return (
    <Section id="pricing">
      <Heading index="06" eyebrow={t.pricing.eyebrow} title={t.pricing.title} sub={t.pricing.note} />
      <BillingToggle value={billing} onChange={setBilling} />

      {/* Phones: a swipe row (Apartment Care first, the next card peeking in). Tablet: 2×2. Desktop: 4 in a row.
          Buttons sit at the bottom of equal-height cards. pt-4 leaves room for the "Most popular" badge. */}
      <div
        ref={rowRef}
        className="swipe-row -mx-5 mt-8 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-5 pb-2 pt-4 scroll-px-5 sm:-mx-8 sm:px-8 md:mx-0 md:mt-10 md:grid md:snap-none md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 md:pt-0 lg:grid-cols-4 lg:pt-3"
      >
        {plans.map((p, i) => (
          <PlanCard key={p.id} plan={p} billing={billing} delay={i * 90} />
        ))}
      </div>
      <div className="mt-2 flex justify-center md:hidden" role="group" aria-label={t.pricing.plansNav}>
        {PHONE_ORDER.map((p) => (
          <button
            key={p.id} type="button" onClick={() => show(p.id)} aria-label={tx(p.name, lang)} aria-current={active === p.id ? "true" : undefined}
            className="grid size-11 place-items-center"
          >
            <span className={`h-2 rounded-full transition-[width,background-color] duration-300 ${active === p.id ? "w-6 bg-primary" : "w-2 bg-foreground/20"}`} />
          </button>
        ))}
      </div>

      <BusinessBanner />
      <p className="reveal mx-auto mt-8 max-w-2xl text-center text-sm text-muted-foreground">{t.pricing.benchmark}</p>
      <ComparePlans />
    </Section>
  );
}

function BillingToggle({ value, onChange }: { value: Billing; onChange: (b: Billing) => void }) {
  const { t } = useT();
  const options: [Billing, string][] = [
    ["monthly", t.pricing.monthly],
    ["yearly", t.pricing.yearly],
  ];
  return (
    <fieldset className="reveal m-0 flex min-w-0 justify-center border-0 p-0">
      <legend className="sr-only">{t.pricing.billing}</legend>
      <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-[var(--shadow-soft)]">
        {options.map(([id, label]) => (
          <div key={id}>
            <input
              type="radio" id={`billing-${id}`} name="billing" value={id}
              checked={value === id} onChange={() => onChange(id)} className="peer sr-only"
            />
            <label
              htmlFor={`billing-${id}`}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-5 text-sm font-semibold text-muted-foreground transition-[background-color,color] duration-200 hover:text-foreground peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
            >
              {label}
              {id === "yearly" && (
                <span className="whitespace-nowrap rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-brand-text">{t.pricing.save}</span>
              )}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

function PlanCard({ plan, billing, delay }: { plan: Plan; billing: Billing; delay: number }) {
  const { t, lang } = useT();
  const pop = Boolean(plan.popular);
  const price = plan.price[billing];
  const paid = plan.price.yearly > 0;
  const per = billing === "yearly" ? t.pricing.perYear : t.pricing.perMonth;
  const ctaClass =
    plan.ctaStyle === "primary"
      ? "btn-primary"
      : plan.ctaStyle === "onMaroon"
        ? "bg-ink-foreground text-ink hover:bg-ink-foreground/85" // cream on maroon in both themes
        : "btn-ghost";
  return (
    <article
      aria-labelledby={`plan-${plan.id}`}
      data-plan={plan.id}
      className={`reveal relative flex w-[84%] max-w-sm shrink-0 snap-center flex-col p-6 sm:p-7 md:w-auto md:max-w-none ${
        pop
          ? "pop-card order-first rounded-[var(--radius-2xl)] bg-maroon-gradient text-primary-foreground shadow-[var(--shadow-lift)] md:order-none lg:-mt-3"
          : "spotlight card-premium hover-lift"
      }`}
      style={d(delay)}
    >
      {pop && <span className="sheen" aria-hidden />}
      {pop && (
        <span className="badge-pop absolute -top-3 start-7 rounded-full border border-primary-foreground/40 bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
          {t.pricing.popular}
        </span>
      )}
      <h3 id={`plan-${plan.id}`} className="text-xl font-bold" translate={plan.brandName ? "no" : undefined}>
        {tx(plan.name, lang)}
      </h3>
      <p className={`text-sm ${pop ? "opacity-85" : "text-muted-foreground"}`}>{tx(plan.subtitle, lang)}</p>
      <p className="mt-6 font-display text-4xl font-extrabold tabular-nums">
        <span dir="ltr" className="whitespace-nowrap">
          <span aria-hidden="true"><CountUp to={price} fromZero={false} duration={500} /></span>
          <span className="sr-only">{price}</span> <span className="text-lg font-semibold">QAR</span>
        </span>
        {paid && <span className="text-base font-medium opacity-80"> {per}</span>}
      </p>
      {/* "Sample" under every paid price; the empty line on Free keeps the features aligned across cards. */}
      <p className="mt-1 min-h-4 text-xs opacity-80">{paid ? t.pricing.sample : ""}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((f) => (
          <li key={f.en} className="flex gap-2 text-sm">
            <Check className={`size-5 shrink-0 ${pop ? "" : "text-brand-text"}`} aria-hidden />
            <span>{tx(f, lang)}</span>
          </li>
        ))}
      </ul>
      <a href={plan.href} className={`btn mt-8 w-full ${ctaClass}`}>
        {tx(plan.cta, lang)}
      </a>
    </article>
  );
}

function BusinessBanner() {
  const { t, lang } = useT();
  return (
    <article
      aria-labelledby="plan-business"
      className="reveal spotlight card-premium hover-lift mt-6 flex flex-col gap-6 p-7 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-5 md:flex-row md:items-center md:gap-8">
        <div className="flex items-start gap-4 md:w-60 md:shrink-0">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 id="plan-business" className="text-xl font-bold">{tx(businessPlan.name, lang)}</h3>
            <p className="text-sm text-muted-foreground">{tx(businessPlan.subtitle, lang)}</p>
          </div>
        </div>
        <ul className="grid flex-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {businessPlan.features.map((f) => (
            <li key={f.en} className="flex gap-2 text-sm">
              <Check className="size-5 shrink-0 text-brand-text" aria-hidden />
              <span>{tx(f, lang)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
        <p className="font-display text-3xl font-extrabold">{t.pricing.custom}</p>
        <a href={businessPlan.href} className="btn btn-ghost w-full sm:w-auto">{tx(businessPlan.cta, lang)}</a>
      </div>
    </article>
  );
}

function ComparePlans() {
  const { t, lang } = useT();
  const cell = (c: CompareCell) =>
    c === true ? (
      <>
        <Check className="mx-auto size-5 text-brand-text" aria-hidden />
        <span className="sr-only">{t.pricing.included}</span>
      </>
    ) : c === false ? (
      <>
        <Minus className="mx-auto size-5 text-muted-foreground" aria-hidden />
        <span className="sr-only">{t.pricing.notIncluded}</span>
      </>
    ) : (
      <span className="font-medium">{tx(c, lang)}</span>
    );
  return (
    <Accordion type="single" collapsible className="reveal mx-auto mt-4 max-w-5xl">
      <AccordionItem value="compare" className="border-0">
        <AccordionTrigger className="mx-auto min-h-11 flex-none gap-2 px-3 font-display text-base font-semibold text-brand-text">
          {t.pricing.compare}
        </AccordionTrigger>
        <AccordionContent className="px-1 pt-1">
          <div className="overflow-x-auto rounded-2xl border border-border bg-card" role="region" aria-label={t.pricing.compare} tabIndex={0}>
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="sticky start-0 z-10 min-w-36 border-e border-border bg-card p-3 text-start font-medium text-muted-foreground md:static md:border-e-0">{t.pricing.feature}</th>
                  {plans.map((p) => (
                    <th
                      key={p.id} scope="col" translate={p.brandName ? "no" : undefined}
                      className={`p-3 text-center font-display font-bold ${p.popular ? "bg-primary text-primary-foreground" : ""}`}
                    >
                      {tx(p.name, lang)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planComparison.map((row) => (
                  <tr key={row.label.en} className="border-b border-border last:border-0">
                    <th scope="row" className="sticky start-0 z-10 min-w-36 border-e border-border bg-card p-3 text-start font-medium md:static md:border-e-0">{tx(row.label, lang)}</th>
                    {row.cells.map((c, i) => (
                      <td key={i} className={`p-3 text-center ${plans[i]?.popular ? "bg-primary/5" : ""}`}>{cell(c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
