import type { ComponentProps, ReactNode } from "react";
import { AlertCircle, Check, ChevronDown, FileCheck2, Loader2, Upload } from "lucide-react";
import { useT } from "@/lib/prefs";
import { langInfo } from "@/lib/langs";
import type { Dict } from "@/lib/i18n";
import { formatQaMobile, onlyDigits } from "@/data/signup";

export type ErrKey = keyof Dict["auth"]["errors"];
type Aria = { id: string; "aria-invalid": boolean; "aria-describedby": string | undefined };

/** Shared look for text inputs and selects. 16px text stops iOS from zooming on focus. */
export const inputCls =
  "h-12 w-full rounded-xl border border-input bg-card px-4 text-base text-foreground placeholder:text-muted-foreground/70 transition-[border-color,box-shadow] duration-150 hover:border-foreground/25 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15 aria-[invalid=true]:border-danger";

function ErrorText({ id, error }: { id: string; error: ErrKey }) {
  const { t } = useT();
  return (
    <p id={id} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
      {t.auth.errors[error]}
    </p>
  );
}

/** Label + control + hint or error, wired together with ids for screen readers. */
export function Field({
  id, label, hint, error, optional, className, children,
}: {
  id: string; label: ReactNode; hint?: string | undefined; error?: ErrKey | undefined; optional?: boolean;
  className?: string; children: (aria: Aria) => ReactNode;
}) {
  const { t } = useT();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-baseline justify-between gap-3 text-sm font-semibold">
        <span>{label}</span>
        {optional && <span className="label-mono font-normal text-muted-foreground">{t.auth.optional}</span>}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <ErrorText id={`${id}-error`} error={error} />
      ) : (
        hint && <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function TextInput(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function SelectInput({ children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select {...props} className={`${inputCls} cursor-pointer appearance-none pe-11`}>{children}</select>
      <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
    </div>
  );
}

/** Qatar mobile number with a fixed +974 prefix. Stores 8 digits; shows "5501 2345". Numbers read left to right in Arabic too. */
export function PhoneInput({ value, onChange, ...aria }: Aria & { value: string; onChange: (digits: string) => void }) {
  return (
    <div
      dir="ltr"
      className="flex h-12 w-full overflow-hidden rounded-xl border border-input bg-card transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15 hover:border-foreground/25 has-[[aria-invalid=true]]:border-danger"
    >
      <span className="grid place-items-center border-e border-input bg-secondary/60 px-3.5 text-base font-semibold tabular-nums text-muted-foreground">+974</span>
      <input
        {...aria}
        type="tel"
        name="mobile"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="5501 2345"
        value={formatQaMobile(value)}
        onChange={(e) => {
          let d = onlyDigits(e.target.value);
          if (d.length > 8 && d.startsWith("974")) d = d.slice(3); // pasted with the country code
          onChange(d.slice(0, 8));
        }}
        className="min-w-0 flex-1 bg-transparent px-3.5 text-base tabular-nums text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none"
      />
    </div>
  );
}

/** Pill-shaped checkboxes (multiple) or radios (single). The first input gets `id` so errors can focus it. */
export function ChoiceChips<T extends string>({
  id, legend, options, value, onChange, multiple, error,
}: {
  id: string; legend: string; options: readonly { id: T; label: string }[]; value: readonly T[];
  onChange: (next: T[]) => void; multiple?: boolean; error?: ErrKey | undefined;
}) {
  const toggle = (o: T) => onChange(multiple ? (value.includes(o) ? value.filter((v) => v !== o) : [...value, o]) : [o]);
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o, i) => {
          const checked = value.includes(o.id);
          return (
            <label key={o.id} className="relative">
              <input
                type={multiple ? "checkbox" : "radio"}
                id={i === 0 ? id : undefined}
                name={id}
                value={o.id}
                checked={checked}
                onChange={() => toggle(o.id)}
                aria-invalid={Boolean(error)}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-11 cursor-pointer select-none items-center gap-1.5 rounded-full border border-input bg-card px-4 text-sm font-medium transition-colors hover:border-foreground/30 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
                {checked && <Check className="size-3.5" aria-hidden />}
                <span className="tabular-nums">{o.label}</span>
              </span>
            </label>
          );
        })}
      </div>
      {error && <ErrorText id={`${id}-error`} error={error} />}
    </fieldset>
  );
}

/** Large radio cards for picking one of a few options with a short description. */
export function RadioCards<T extends string>({
  id, legend, options, value, onChange,
}: {
  id: string; legend: string; value: T; onChange: (v: T) => void;
  options: readonly { id: T; title: string; desc: string; icon: ReactNode }[];
}) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <label key={o.id} className="relative">
            <input type="radio" name={id} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="peer sr-only" />
            <span className="flex h-full cursor-pointer gap-3 rounded-2xl border border-input bg-card p-4 pe-9 transition-[border-color,box-shadow] hover:border-foreground/30 peer-checked:border-primary peer-checked:shadow-[0_0_0_1px_var(--primary)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-brand-text" aria-hidden>{o.icon}</span>
              <span className="min-w-0">
                <span className="block font-display font-bold">{o.title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{o.desc}</span>
              </span>
            </span>
            <span className="absolute end-3 top-3 hidden size-5 place-items-center rounded-full bg-primary text-primary-foreground peer-checked:grid" aria-hidden>
              <Check className="size-3" />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CheckField({
  id, checked, onChange, error, children,
}: { id: string; checked: boolean; onChange: (v: boolean) => void; error?: ErrKey | undefined; children: ReactNode }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 rounded-xl border border-input bg-card p-4 text-sm transition-colors hover:border-foreground/30 has-[:checked]:border-primary"
      >
        <input
          type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary"
        />
        <span>{children}</span>
      </label>
      {error && <ErrorText id={`${id}-error`} error={error} />}
    </div>
  );
}

/** File picker that only keeps the file's name: nothing is uploaded in the prototype. */
export function FileField({
  id, label, fileName, onChange, optional, error,
}: { id: string; label: string; fileName?: string | undefined; onChange: (name: string | undefined) => void; optional?: boolean; error?: ErrKey | undefined }) {
  const { t } = useT();
  return (
    <div>
      <div
        className={`flex items-center justify-between gap-3 rounded-xl border bg-card p-3 ps-4 ${
          error ? "border-danger" : fileName ? "border-primary/50" : "border-dashed border-input"
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          {fileName && <FileCheck2 className="size-5 shrink-0 text-brand-text" aria-hidden />}
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {label}
              {optional && <span className="label-mono ms-2 font-normal text-muted-foreground">{t.auth.optional}</span>}
            </p>
            {/* plain mono, not .label-mono: file names keep their own case */}
            <p className="truncate font-mono text-xs text-muted-foreground" dir="ltr">{fileName ?? "PDF · JPG · PNG"}</p>
          </div>
        </div>
        <label className="btn btn-ghost min-h-11 shrink-0 cursor-pointer px-4 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring">
          <Upload className="size-4" aria-hidden />
          {fileName ? t.auth.biz.replace : t.auth.biz.upload}
          <input
            type="file" id={id} accept=".pdf,.jpg,.jpeg,.png" className="sr-only"
            aria-label={label} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
            onChange={(e) => onChange(e.target.files?.[0]?.name)}
          />
        </label>
      </div>
      {error && <ErrorText id={`${id}-error`} error={error} />}
    </div>
  );
}

/** Dashed "Demo mode" strip that says what is simulated, with optional bypass buttons. */
export function DemoNote({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  const { t } = useT();
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/[0.05] p-4 dark:border-foreground/25 dark:bg-foreground/[0.04]">
      <p className="flex items-start gap-2.5 text-sm">
        <span className="label-mono mt-px shrink-0 rounded-full bg-primary px-2 py-0.5 text-[0.66rem] text-primary-foreground">{t.auth.demo}</span>
        <span>{children}</span>
      </p>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SubmitButton({ busy, label, busyLabel, className = "" }: { busy: boolean; label: string; busyLabel: string; className?: string }) {
  return (
    <button type="submit" disabled={busy} aria-busy={busy} className={`btn btn-primary disabled:cursor-wait disabled:opacity-80 ${className}`}>
      {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {busy ? busyLabel : label}
    </button>
  );
}

/** "Step 2 of 4" with a bar per step; labels under the bars when given. */
export function StepBar({ current, total, labels }: { current: number; total: number; labels?: readonly string[] }) {
  const { t, lang } = useT();
  const nf = new Intl.NumberFormat(langInfo(lang).intl);
  return (
    <div>
      <p className="label-mono text-muted-foreground" aria-live="polite">
        {t.auth.step.replace("{n}", nf.format(current + 1)).replace("{total}", nf.format(total))}
        {labels?.[current] && <span className="text-foreground"> · {labels[current]}</span>}
      </p>
      <ol className="mt-2.5 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <li key={i}>
            <div className={`h-1 rounded-full transition-colors duration-300 ${i <= current ? "bg-primary" : "bg-border"}`} />
            {labels && <span className={`label-mono mt-1.5 hidden text-[0.66rem] sm:block ${i === current ? "text-foreground" : "text-muted-foreground"}`}>{labels[i]}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
