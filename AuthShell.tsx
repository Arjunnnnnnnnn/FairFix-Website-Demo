import type { ReactNode } from "react";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { usePrefs, useT } from "@/lib/prefs";
import { Logo } from "@/components/site/Nav";
import { LanguageMenu } from "@/components/site/LanguageMenu";
import { Rich } from "@/components/site/Section";
import { AccountSummary } from "@/components/site/AccountMenu";
import { displayName, useAccount } from "@/lib/account";

/**
 * Page frame for the sign-up flows: a slim header and the form on one side,
 * a maroon panel with the pitch on the other (desktop only).
 */
export function AuthShell({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  const { t, lang } = useT();
  const { dark, setDark } = usePrefs();
  const iconBtn = "grid size-11 place-items-center rounded-full border border-border bg-card/60 transition-colors hover:bg-secondary";
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)]">
      <div className="flex min-h-dvh flex-col">
        <header className="flex h-16 items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <Logo href="/" />
          <div className="flex items-center gap-2">
            <a href="/" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex">
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
              {t.auth.back}
            </a>
            <LanguageMenu />
            <button className={iconBtn} onClick={() => setDark(!dark)} aria-label={t.nav.theme}>
              {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
            </button>
          </div>
        </header>
        <main id="main" className="flex flex-1 flex-col px-5 pb-16 pt-6 sm:px-8 sm:pt-12 lg:px-12">
          <div className="mx-auto w-full max-w-xl">{children}</div>
        </main>
      </div>
      {/* overflow-clip (not hidden) so the sticky panel still sticks */}
      <aside className="relative hidden overflow-clip bg-maroon-gradient text-primary-foreground [--brand-text:var(--primary-foreground)] [--pattern-color:oklch(1_0_0/6%)] lg:block">
        <div className="pattern-layer" aria-hidden />
        <div className="sticky top-0 flex min-h-dvh flex-col justify-center p-12 xl:p-16">{aside}</div>
      </aside>
    </div>
  );
}

/** Pitch for the maroon panel: mono label, big headline with a serif accent, numbered points. */
export function AsidePitch({ label, title, points, footer }: { label: string; title: string; points: { t: string; d?: string }[]; footer?: ReactNode }) {
  return (
    <div className="max-w-md">
      <p className="label-mono flex items-center gap-3 opacity-80">
        <span>{label}</span>
        <span className="h-px flex-1 bg-current opacity-40" aria-hidden />
      </p>
      <p className="display-tight mt-6 font-display text-5xl font-extrabold leading-[1.02] xl:text-[3.4rem]">
        <Rich text={title} />
      </p>
      <ol className="mt-10 border-t border-primary-foreground/20">
        {points.map((p, i) => (
          <li key={p.t} className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-b border-primary-foreground/20 py-4">
            <span className="label-mono pt-1 tabular-nums opacity-70">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <p className="font-display text-lg font-bold leading-snug">{p.t}</p>
              {p.d && <p className="mt-1 text-sm opacity-80">{p.d}</p>}
            </div>
          </li>
        ))}
      </ol>
      {footer && <div className="mt-8">{footer}</div>}
    </div>
  );
}

/** Small product card in the style of the hero's floating cards. */
export function MiniCard({ icon, title, caption }: { icon: ReactNode; title: string; caption: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-2xl border border-border bg-card py-2 ps-2 pe-4 text-foreground shadow-[var(--shadow-lift)]">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground" aria-hidden>{icon}</span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="label-mono block text-[0.66rem] text-muted-foreground">{caption}</span>
      </span>
    </div>
  );
}

/** Shown on the sign-up pages to someone already signed in, with a way to start over. */
export function AlreadySignedIn() {
  const { t } = useT();
  const { account, signOut } = useAccount();
  if (!account) return null;
  const a = t.auth.account;
  return (
    <div className="intro">
      <div className="w-fit rounded-2xl border border-border bg-card p-3 pe-5">
        <AccountSummary account={account} />
      </div>
      <div className="mt-8">
        <FormHeading title={a.alreadyTitle.replace("{name}", displayName(account))} sub={a.alreadySub} />
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href="/" className="btn btn-primary">{a.home}</a>
        <button type="button" onClick={signOut} className="btn btn-ghost">{a.switch}</button>
      </div>
    </div>
  );
}

export function FormHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <>
      <h1 className="display-tight text-4xl font-extrabold leading-[1.05] sm:text-5xl">
        <Rich text={title} />
      </h1>
      {sub && <p className="mt-3 text-pretty text-muted-foreground">{sub}</p>}
    </>
  );
}
