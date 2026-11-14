import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, BadgeCheck, Building2, Check, Wrench } from "lucide-react";
import { usePageTitle, useT } from "@/lib/prefs";
import { tx } from "@/lib/dict";
import { useAccount } from "@/lib/account";
import { pricing } from "@/data/demo";
import { businessPlan } from "@/data/pricing";
import {
  AREAS, EMAIL, EMPTY_BIZ, ORG_TYPES, QA_MOBILE, SAMPLE_BIZ, SAMPLE_PARTNER_ID, SERVICES, TEAM_SIZES, UNIT_COUNTS,
  formatQaMobile, onlyDigits, type BizForm, type BizType, type DocKey,
} from "@/data/signup";
import { QrCode } from "@/components/site/QrCode";
import { AlreadySignedIn, AsidePitch, AuthShell, FormHeading } from "./AuthShell";
import {
  CheckField, ChoiceChips, DemoNote, Field, FileField, PhoneInput, RadioCards, SelectInput, StepBar, SubmitButton, TextInput,
  type ErrKey,
} from "./fields";

const LAST = 3; // steps 0–3; 4 is the approval screen
const DONE = 4;
const fakeRequest = (ms = 900) => new Promise((r) => setTimeout(r, ms));
const CR_DIGITS = /^\d{4,10}$/;

type ErrField =
  | "name" | "cr" | "licence" | "orgType" | "services" | "team" | "units" | "areas"
  | "contactName" | "email" | "mobile" | "docCr" | "docLicence" | "agree";
type Errors = Partial<Record<ErrField, ErrKey>>;
/** Element id for each field, so the first error can be focused. */
const fid = (k: ErrField) => `b-${k}`;

/** Checks only the fields on the given step. Keys come out in on-screen order. */
function validate(step: number, f: BizForm): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (f.name.trim().length < 2) e.name = "required";
    if (!CR_DIGITS.test(f.cr)) e.cr = f.cr ? "digits" : "required";
    if (f.type === "partner" && !CR_DIGITS.test(f.licence)) e.licence = f.licence ? "digits" : "required";
    if (f.type === "property" && !f.orgType) e.orgType = "pick";
  }
  if (step === 1) {
    if (f.type === "partner" && !f.services.length) e.services = "pickOne";
    if (f.type === "partner" && !f.team) e.team = "pick";
    if (f.type === "property" && !f.units) e.units = "pick";
    if (!f.areas.length) e.areas = "pickOne";
  }
  if (step === 2) {
    if (f.contactName.trim().length < 2) e.contactName = "required";
    if (!EMAIL.test(f.email.trim())) e.email = f.email ? "email" : "required";
    if (!QA_MOBILE.test(f.mobile)) e.mobile = f.mobile ? "phone" : "required";
  }
  if (step === 3) {
    if (!f.docs.cr) e.docCr = "required";
    if (f.type === "partner" && !f.docs.licence) e.docLicence = "required";
    if (!f.agree) e.agree = "agree";
  }
  return e;
}

/**
 * Business sign-up for maintenance companies (Verified Partners) and property businesses.
 * Asks for what a real review would need (CR, licence, services, coverage, contact, documents),
 * but it is front-end only: nothing is uploaded, and the demo bar can fill or skip it. The approved
 * account is saved on this device only (src/lib/account.tsx).
 */
export function BusinessSignup({ initialType }: { initialType?: BizType | undefined }) {
  const { t, lang } = useT();
  const b = t.auth.biz;
  usePageTitle((d) => d.auth.biz.title);
  const { account, loaded, signIn } = useAccount();

  const [form, setForm] = useState<BizForm>(() => ({ ...EMPTY_BIZ, type: initialType ?? "partner" }));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const stepHeading = useRef<HTMLHeadingElement>(null);
  const isPartner = form.type === "partner";
  // Typed-in details count as unsaved; an empty form or the demo sample does not.
  const snapshot = JSON.stringify(form);
  const dirty = snapshot !== JSON.stringify({ ...EMPTY_BIZ, type: form.type }) && snapshot !== JSON.stringify(SAMPLE_BIZ[form.type]);

  // Ask before leaving a half-filled form.
  useEffect(() => {
    if (!dirty || step === DONE) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, step]);

  const set = <K extends keyof BizForm>(k: K, v: BizForm[K], err?: ErrField) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (err) setErrors((e) => {
      const rest = { ...e };
      delete rest[err];
      return rest;
    });
  };
  const setDoc = (k: DocKey, name: string | undefined, err?: ErrField) =>
    set("docs", { ...form.docs, [k]: name }, err);

  const goTo = (s: number) => {
    setErrors({});
    setStep(s);
    window.scrollTo(0, 0);
    // Let screen reader and keyboard users land on the new step.
    requestAnimationFrame(() => stepHeading.current?.focus({ preventScroll: true }));
  };

  async function next(e: FormEvent) {
    e.preventDefault();
    const errs = validate(step, form);
    setErrors(errs);
    const first = (Object.keys(errs) as ErrField[])[0];
    if (first) {
      document.getElementById(fid(first))?.focus();
      return;
    }
    if (step < LAST) return goTo(step + 1);
    setBusy(true);
    await fakeRequest();
    setBusy(false);
    finish(form);
  }

  /** Signs the business in on this device and shows the approval screen. */
  const finish = (f: BizForm) => {
    signIn({
      kind: "business", type: f.type, name: f.name.trim(), contactName: f.contactName.trim(), cr: f.cr,
      partnerId: f.type === "partner" ? SAMPLE_PARTNER_ID : undefined,
    });
    goTo(DONE);
  };

  /** Demo bypass: fill everything with sample details and jump to the last step. */
  const fillSample = () => {
    setForm(SAMPLE_BIZ[form.type]);
    goTo(LAST);
  };
  /** Demo bypass: go straight to approval, using sample details if the form is still empty. */
  const skip = () => {
    const f = form.name.trim() ? form : SAMPLE_BIZ[form.type];
    setForm(f);
    finish(f);
  };

  const opt = <T extends string>(list: readonly { id: T; label: { en: string; ar: string } }[]) =>
    list.map((o) => ({ id: o.id, label: tx(o.label, lang) }));
  const plain = (list: readonly string[]) => list.map((v) => ({ id: v, label: v }));

  const aside = isPartner ? (
    <AsidePitch
      label={b.asideLabel}
      title={t.techs.title}
      points={t.techs.items}
      footer={
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className="opacity-80">{t.techs.price}</span>
          <span className="font-display text-2xl font-bold tabular-nums" dir="ltr">{pricing.partnerMonthly} QAR</span>
          <span className="label-mono opacity-70">{t.techs.sample}</span>
        </p>
      }
    />
  ) : (
    <AsidePitch label={b.asideLabel} title={b.asideProperty} points={businessPlan.features.map((f) => ({ t: tx(f, lang) }))} />
  );

  // Already signed in on this device: offer home or a fresh start instead of a second sign-up.
  if (loaded && account && step === 0) {
    return (
      <AuthShell aside={aside}>
        <AlreadySignedIn />
      </AuthShell>
    );
  }

  if (step === DONE) {
    return (
      <AuthShell aside={aside}>
        <Approved form={form} />
      </AuthShell>
    );
  }

  return (
    <AuthShell aside={aside}>
      <FormHeading title={b.heading} sub={b.sub} />
      <div className="mt-6">
        <DemoNote
          actions={
            <>
              <button type="button" onClick={fillSample} className="btn btn-ghost min-h-10 px-4 text-sm">{b.fill}</button>
              <button type="button" onClick={skip} className="btn btn-ghost min-h-10 px-4 text-sm">{b.skip}</button>
            </>
          }
        >
          {b.demoNote}
        </DemoNote>
      </div>

      <div className="mt-8">
        <StepBar current={step} total={LAST + 1} labels={b.steps} />
      </div>

      <form noValidate onSubmit={next} className="mt-8">
        <h2 ref={stepHeading} tabIndex={-1} className="sr-only">{b.steps[step]}</h2>
        <div key={step} className="intro space-y-6">
          {step === 0 && (
            <>
              <RadioCards
                id="b-type"
                legend={b.type}
                value={form.type}
                onChange={(v) => set("type", v)}
                options={[
                  { id: "partner", title: b.types.partner.t, desc: b.types.partner.d, icon: <Wrench className="size-5" /> },
                  { id: "property", title: b.types.property.t, desc: b.types.property.d, icon: <Building2 className="size-5" /> },
                ]}
              />
              <Field id={fid("name")} label={b.name} hint={b.nameHint} error={errors.name}>
                {(aria) => (
                  <TextInput {...aria} name="organization" autoComplete="organization" value={form.name} onChange={(e) => set("name", e.target.value, "name")} />
                )}
              </Field>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id={fid("cr")} label={b.cr} hint={b.digitsHint} error={errors.cr}>
                  {(aria) => (
                    <TextInput {...aria} name="cr" inputMode="numeric" autoComplete="off" dir="ltr" className="text-start tabular-nums" placeholder="123456"
                      value={form.cr} onChange={(e) => set("cr", e.target.value.trim(), "cr")} />
                  )}
                </Field>
                {isPartner ? (
                  <Field id={fid("licence")} label={b.licence} hint={b.digitsHint} error={errors.licence}>
                    {(aria) => (
                      <TextInput {...aria} name="licence" inputMode="numeric" autoComplete="off" dir="ltr" className="text-start tabular-nums" placeholder="987654"
                        value={form.licence} onChange={(e) => set("licence", e.target.value.trim(), "licence")} />
                    )}
                  </Field>
                ) : (
                  <Field id={fid("orgType")} label={b.orgType} error={errors.orgType}>
                    {(aria) => (
                      <SelectInput {...aria} name="orgType" value={form.orgType} onChange={(e) => set("orgType", e.target.value as BizForm["orgType"], "orgType")}>
                        <option value="" disabled>{b.choose}</option>
                        {ORG_TYPES.map((o) => <option key={o.id} value={o.id}>{tx(o.label, lang)}</option>)}
                      </SelectInput>
                    )}
                  </Field>
                )}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              {isPartner ? (
                <>
                  <ChoiceChips id={fid("services")} legend={b.services} multiple options={opt(SERVICES)} value={form.services}
                    onChange={(v) => set("services", v, "services")} error={errors.services} />
                  <ChoiceChips id={fid("team")} legend={b.team} options={plain(TEAM_SIZES)} value={form.team ? [form.team] : []}
                    onChange={(v) => set("team", v[0] ?? "", "team")} error={errors.team} />
                </>
              ) : (
                <ChoiceChips id={fid("units")} legend={b.units} options={plain(UNIT_COUNTS)} value={form.units ? [form.units] : []}
                  onChange={(v) => set("units", v[0] ?? "", "units")} error={errors.units} />
              )}
              <ChoiceChips id={fid("areas")} legend={isPartner ? b.areasPartner : b.areasProperty} multiple options={opt(AREAS)} value={form.areas}
                onChange={(v) => set("areas", v, "areas")} error={errors.areas} />
              {isPartner && (
                <CheckField id="b-insurance" checked={form.insurance} onChange={(v) => set("insurance", v)}>
                  {b.insurance}
                </CheckField>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field id={fid("contactName")} label={b.contactName} error={errors.contactName}>
                  {(aria) => (
                    <TextInput {...aria} name="name" autoComplete="name" value={form.contactName} onChange={(e) => set("contactName", e.target.value, "contactName")} />
                  )}
                </Field>
                <Field id="b-role" label={b.role} optional>
                  {(aria) => (
                    <TextInput {...aria} name="role" autoComplete="organization-title" placeholder={b.rolePh} value={form.role} onChange={(e) => set("role", e.target.value)} />
                  )}
                </Field>
              </div>
              <Field id={fid("email")} label={b.email} error={errors.email}>
                {(aria) => (
                  <TextInput {...aria} type="email" name="email" dir="ltr" autoComplete="email" spellCheck={false} placeholder="name@company.qa" className="text-start"
                    value={form.email} onChange={(e) => set("email", e.target.value, "email")} />
                )}
              </Field>
              <Field id={fid("mobile")} label={b.mobile} error={errors.mobile}>
                {(aria) => <PhoneInput {...aria} value={form.mobile} onChange={(v) => set("mobile", v, "mobile")} />}
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <p className="text-sm font-semibold">{b.docs}</p>
                <p className="mt-1 text-sm text-muted-foreground">{b.docsNote}</p>
              </div>
              <div className="space-y-3">
                <FileField id={fid("docCr")} label={b.docNames.cr} fileName={form.docs.cr} onChange={(n) => setDoc("cr", n, "docCr")} error={errors.docCr} />
                {isPartner && (
                  <>
                    <FileField id={fid("docLicence")} label={b.docNames.licence} fileName={form.docs.licence} onChange={(n) => setDoc("licence", n, "docLicence")} error={errors.docLicence} />
                    <FileField id="b-docInsurance" label={b.docNames.insurance} optional fileName={form.docs.insurance} onChange={(n) => setDoc("insurance", n)} />
                    <FileField id="b-docIds" label={b.docNames.ids} optional fileName={form.docs.ids} onChange={(n) => setDoc("ids", n)} />
                  </>
                )}
              </div>
              <CheckField id={fid("agree")} checked={form.agree} onChange={(v) => set("agree", v, "agree")} error={errors.agree}>
                {isPartner ? b.agreePartner : b.agreeProperty}
              </CheckField>
            </>
          )}
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => goTo(step - 1)} className="btn btn-ghost">
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
              {b.back}
            </button>
          ) : (
            <span />
          )}
          <SubmitButton busy={busy} label={step === LAST ? b.submit : b.next} busyLabel={b.submitting} className="sm:min-w-44" />
        </div>
      </form>
    </AuthShell>
  );
}

/** Demo approval screen: a Verified Partner card, or a summary for property businesses. */
function Approved({ form }: { form: BizForm }) {
  const { t, lang } = useT();
  const b = t.auth.biz;
  const isPartner = form.type === "partner";
  const services = SERVICES.filter((s) => form.services.includes(s.id));
  const areas = AREAS.filter((a) => form.areas.includes(a.id)).map((a) => tx(a.label, lang)).join(", ");
  const org = tx(ORG_TYPES.find((o) => o.id === form.orgType)?.label, lang);
  return (
    <div className="intro">
      <p className="label-mono inline-flex items-center gap-2 text-brand-text">
        <Check className="size-3.5" aria-hidden />
        {b.doneLabel}
      </p>
      <div className="mt-4">
        <FormHeading title={isPartner ? b.donePartner : b.doneProperty} sub={isPartner ? b.donePartnerSub : b.donePropertySub} />
      </div>

      {isPartner ? (
        <div className="mt-8 overflow-hidden rounded-[var(--radius-2xl)] border border-border bg-card shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between gap-3 bg-maroon-gradient px-5 py-3 text-primary-foreground">
            <span className="inline-flex items-center gap-2 font-semibold">
              <BadgeCheck className="size-5" aria-hidden />
              {b.badge}
            </span>
            <span className="label-mono" translate="no">
              <span className="sr-only">{b.partnerId} </span>
              {SAMPLE_PARTNER_ID}
            </span>
          </div>
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
            <QrCode seed={form.name || SAMPLE_PARTNER_ID} size={104} label={`${t.a11y.qr} ${form.name}`} />
            <div className="min-w-0">
              <p className="font-display text-xl font-bold leading-tight" translate="no">{form.name}</p>
              <p className="label-mono mt-1 text-muted-foreground" dir="ltr">CR {form.cr}{form.team && ` · ${form.team}`}</p>
              {services.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {services.map((s) => (
                    <li key={s.id} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">{tx(s.label, lang)}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : (
        <dl className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
          {[
            [b.name, form.name],
            [b.orgType, org],
            [b.units, form.units],
            [b.areasProperty, areas],
            [b.contactName, form.contactName],
            [b.mobile, form.mobile && <span key="m" dir="ltr" className="tabular-nums">+974 {formatQaMobile(onlyDigits(form.mobile))}</span>],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={String(k)} className="flex items-start justify-between gap-4 px-5 py-3.5">
                <dt className="label-mono pt-0.5 text-muted-foreground">{k}</dt>
                <dd className="text-end font-semibold">{v}</dd>
              </div>
            ))}
        </dl>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href="/" className="btn btn-primary">{b.backHome}</a>
        <a href="/#demo" className="btn btn-ghost">{b.tryDemo}</a>
      </div>
    </div>
  );
}
