import { useEffect, useRef, useState, type FormEvent } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowRight, BadgeCheck, Check, Lock } from "lucide-react";
import { usePageTitle, useT } from "@/lib/prefs";
import { tx } from "@/lib/dict";
import { useAccount } from "@/lib/account";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { plans, type PlanId } from "@/data/pricing";
import { AREAS, EMAIL, HOME_TYPES, QA_MOBILE, formatQaMobile, type AreaId, type HomeType } from "@/data/signup";
import { AlreadySignedIn, AsidePitch, AuthShell, FormHeading, MiniCard } from "./AuthShell";
import { ChoiceChips, DemoNote, Field, PhoneInput, SelectInput, StepBar, SubmitButton, TextInput, type ErrKey } from "./fields";

type Step = "phone" | "code" | "profile" | "done";
type ErrField = "phone" | "code" | "name" | "area" | "email";
type Errors = Partial<Record<ErrField, ErrKey>>;
const STEPS: Step[] = ["phone", "code", "profile"];
const DEMO_CODE = "123456";
const RESEND_AFTER = 30;
/** Stands in for a network request so buttons show their busy state. */
const fakeRequest = (ms = 700) => new Promise((r) => setTimeout(r, ms));

/**
 * Resident sign-up: mobile number → one-time code → name and home → done.
 * No SMS is sent and any 6 digits pass the code step. The finished account is saved on this
 * device only (src/lib/account.tsx), so the site remembers the visitor until they sign out.
 */
export function UserSignup({ plan }: { plan?: PlanId | undefined }) {
  const { t, lang } = useT();
  const u = t.auth.user;
  usePageTitle((d) => d.auth.user.title);
  const { account, loaded, signIn } = useAccount();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [area, setArea] = useState<AreaId | "">("");
  const [home, setHome] = useState<HomeType[]>([]);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_AFTER);
  const codeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // Count down to "Resend code" while the code step is open.
  useEffect(() => {
    if (step !== "code" || resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [step, resendIn]);

  // After each step, put the cursor in the next step's first field.
  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
    if (step === "profile") nameRef.current?.focus();
    if (step === "done") window.scrollTo(0, 0);
  }, [step]);

  const clearError = (k: ErrField) =>
    setErrors((e) => {
      const rest = { ...e };
      delete rest[k];
      return rest;
    });

  /** Shows the errors and focuses the first invalid field. Returns true when there are none. */
  const check = (errs: Errors) => {
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) document.getElementById(first)?.focus();
    return !first;
  };

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    if (!check(QA_MOBILE.test(phone) ? {} : { phone: phone ? "phone" : "required" })) return;
    setBusy(true);
    await fakeRequest();
    setBusy(false);
    setCode("");
    setResendIn(RESEND_AFTER);
    setStep("code");
  }

  async function verify(value = code) {
    if (busy) return;
    if (!check(value.length === 6 ? {} : { code: "code" })) return;
    setBusy(true);
    await fakeRequest(600);
    setBusy(false);
    setStep("profile");
  }

  async function createAccount(e: FormEvent) {
    e.preventDefault();
    const errs: Errors = {};
    if (name.trim().length < 2) errs.name = "required";
    if (!area) errs.area = "pick";
    if (email.trim() && !EMAIL.test(email.trim())) errs.email = "email";
    if (!check(errs)) return;
    setBusy(true);
    await fakeRequest();
    setBusy(false);
    signIn({ kind: "resident", name: name.trim(), phone, area: area || undefined, home: home[0], email: email.trim() || undefined, plan });
    setStep("done");
  }

  const chosenPlan = plans.find((p) => p.id === plan);
  const areaLabel = tx(AREAS.find((a) => a.id === area)?.label, lang);
  const homeLabel = tx(HOME_TYPES.find((h) => h.id === home[0])?.label, lang);

  const aside = (
    <AsidePitch
      label={u.asideLabel}
      title={u.asideTitle}
      points={u.points}
      footer={
        <div className="flex flex-wrap gap-3">
          <MiniCard icon={<Lock className="size-4" />} title={t.hero.float2} caption={t.hero.floatCap2} />
          <MiniCard icon={<BadgeCheck className="size-4" />} title={t.hero.float1} caption={t.hero.floatCap1} />
        </div>
      }
    />
  );

  // Already signed in on this device: offer home or a fresh start instead of a second sign-up.
  if (loaded && account && step === "phone") {
    return (
      <AuthShell aside={aside}>
        <AlreadySignedIn />
      </AuthShell>
    );
  }

  return (
    <AuthShell aside={aside}>
      {step !== "done" && (
        <div className="mb-8">
          <StepBar current={STEPS.indexOf(step)} total={STEPS.length} />
        </div>
      )}

      {/* key={step} replays the entrance animation on every step */}
      <div key={step} className="intro">
        {step === "phone" && (
          <>
            <FormHeading title={u.phoneTitle} sub={u.phoneSub} />
            {chosenPlan && (
              <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/60 px-4 py-3">
                <p className="min-w-0 text-sm">
                  <span className="label-mono me-2 text-muted-foreground">{u.plan}</span>
                  <span className="font-semibold" translate={chosenPlan.brandName ? "no" : undefined}>{tx(chosenPlan.name, lang)}</span>
                  {chosenPlan.price.monthly > 0 && (
                    <span className="text-muted-foreground">
                      {" · "}
                      <span dir="ltr" className="tabular-nums">{chosenPlan.price.monthly} QAR</span> {t.pricing.perMonth}
                    </span>
                  )}
                </p>
                <a href="/#pricing" className="shrink-0 text-sm font-semibold text-brand-text underline-offset-4 hover:underline">{u.changePlan}</a>
              </div>
            )}
            <form noValidate onSubmit={sendCode} className="mt-8 space-y-6">
              <Field id="phone" label={u.phone} hint={u.phoneHint} error={errors.phone}>
                {(aria) => <PhoneInput {...aria} value={phone} onChange={(v) => { setPhone(v); setErrors({}); }} />}
              </Field>
              <DemoNote>{u.smsNote}</DemoNote>
              <SubmitButton busy={busy} label={u.send} busyLabel={u.sending} className="w-full" />
            </form>
            <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
              {u.bizPrompt}{" "}
              <a href="/signup/business" className="inline-flex items-center gap-1 font-semibold text-brand-text underline-offset-4 hover:underline">
                {u.bizLink}
                <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden />
              </a>
            </p>
          </>
        )}

        {step === "code" && (
          <>
            <FormHeading title={u.codeTitle} />
            <p className="mt-3 text-muted-foreground">
              {u.codeSub}{" "}
              <span dir="ltr" className="font-semibold text-foreground tabular-nums">+974 {formatQaMobile(phone)}</span>
              {" · "}
              <button type="button" onClick={() => { setStep("phone"); setErrors({}); }} className="font-semibold text-brand-text underline-offset-4 hover:underline">
                {u.changeNumber}
              </button>
            </p>
            <form noValidate onSubmit={(e) => { e.preventDefault(); void verify(); }} className="mt-8 space-y-6">
              <div>
                <label htmlFor="code" className="mb-2 block text-sm font-semibold">{u.code}</label>
                <div dir="ltr" className="w-fit">
                  <InputOTP
                    id="code"
                    ref={codeRef}
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(v) => { setCode(v); setErrors({}); }}
                    onComplete={(v: string) => void verify(v)}
                    aria-invalid={Boolean(errors.code)}
                    aria-describedby={errors.code ? "code-error" : undefined}
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: 6 }, (_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className={`h-14 w-11 rounded-xl border bg-card text-xl font-semibold tabular-nums shadow-none first:rounded-xl first:border last:rounded-xl sm:w-12 ${errors.code ? "border-danger" : "border-input"}`}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {errors.code && <p id="code-error" className="mt-1.5 text-sm font-medium text-danger">{t.auth.errors.code}</p>}
              </div>
              <DemoNote
                actions={
                  <button type="button" onClick={() => { setCode(DEMO_CODE); void verify(DEMO_CODE); }} className="btn btn-ghost min-h-10 px-4 text-sm">
                    {u.fillCode}
                  </button>
                }
              >
                {u.codeNote}
              </DemoNote>
              <SubmitButton busy={busy} label={u.verify} busyLabel={u.verifying} className="w-full" />
              <p className="text-center text-sm">
                {resendIn > 0 ? (
                  <span className="text-muted-foreground tabular-nums">{u.resendIn.replace("{s}", String(resendIn))}</span>
                ) : (
                  <button type="button" onClick={() => setResendIn(RESEND_AFTER)} className="font-semibold text-brand-text underline-offset-4 hover:underline">
                    {u.resend}
                  </button>
                )}
              </p>
            </form>
          </>
        )}

        {step === "profile" && (
          <>
            <FormHeading title={u.profileTitle} sub={u.profileSub} />
            <form noValidate onSubmit={createAccount} className="mt-8 space-y-6">
              <Field id="name" label={u.name} error={errors.name}>
                {(aria) => (
                  <TextInput {...aria} ref={nameRef} name="name" autoComplete="name" placeholder={u.namePh} value={name}
                    onChange={(e) => { setName(e.target.value); clearError("name"); }} />
                )}
              </Field>
              <Field id="area" label={u.area} error={errors.area}>
                {(aria) => (
                  <SelectInput {...aria} name="area" value={area} onChange={(e) => { setArea(e.target.value as AreaId); clearError("area"); }}>
                    <option value="" disabled>{u.areaPh}</option>
                    {AREAS.map((a) => <option key={a.id} value={a.id}>{tx(a.label, lang)}</option>)}
                  </SelectInput>
                )}
              </Field>
              <ChoiceChips id="home" legend={u.home} options={HOME_TYPES.map((h) => ({ id: h.id, label: tx(h.label, lang) }))} value={home} onChange={setHome} />
              <Field id="email" label={u.email} optional error={errors.email}>
                {(aria) => (
                  <TextInput {...aria} type="email" name="email" dir="ltr" autoComplete="email" spellCheck={false} placeholder="name@example.qa" value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError("email"); }} className="text-start" />
                )}
              </Field>
              <SubmitButton busy={busy} label={u.create} busyLabel={u.creating} className="w-full" />
            </form>
          </>
        )}

        {step === "done" && (
          <>
            <span className="grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground" aria-hidden>
              <Check className="size-7" />
            </span>
            <div className="mt-6">
              <FormHeading title={u.doneTitle.replace("{name}", name.trim().split(/\s+/)[0] ?? "")} sub={u.doneSub} />
            </div>
            <dl className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
              {[
                [u.sPhone, <span key="p" dir="ltr" className="tabular-nums">+974 {formatQaMobile(phone)}</span>],
                [u.sArea, areaLabel],
                [u.sHome, homeLabel],
                [u.sPlan, tx(chosenPlan?.name, lang)],
              ]
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={String(k)} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <dt className="label-mono text-muted-foreground">{k}</dt>
                    <dd className="text-end font-semibold">{v}</dd>
                  </div>
                ))}
            </dl>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/#demo" className="btn btn-primary">{u.tryDemo}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden /></a>
              <a href="/" className="btn btn-ghost">{u.backHome}</a>
            </div>
          </>
        )}
      </div>
    </AuthShell>
  );
}
