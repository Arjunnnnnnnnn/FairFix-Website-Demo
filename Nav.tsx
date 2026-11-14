import { useEffect, useState } from "react";
import { LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { usePrefs, useT } from "@/lib/prefs";
import { useAccount } from "@/lib/account";
import { AccountMenu, AccountSummary } from "./AccountMenu";
import { LanguageMenu } from "./LanguageMenu";
import { APP_NAME } from "@/data/demo";
import { BrandIcon } from "./BrandIcon";

export function Logo({ ink, intro, href = "#top" }: { ink?: boolean; intro?: boolean; href?: string }) {
  return (
    <a href={href} className="flex w-fit shrink-0 items-center gap-2 font-display text-2xl font-extrabold" translate="no" aria-label={APP_NAME}>
      <BrandIcon className={`brand-logo size-10 shrink-0 text-primary ${intro ? "logo-intro" : ""}`} />
      <span dir="ltr"><span className={ink ? "text-ink-foreground" : "text-foreground"}>Fair</span><span className="text-primary">Fix</span></span>
    </a>
  );
}

export function Nav() {
  const { t, lang } = useT();
  const { dark, setDark } = usePrefs();
  const { account, loaded, signOut } = useAccount();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 10);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  // Phone menu: Escape closes it, the page behind can't scroll, and it closes if the screen grows to desktop width.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = () => wide.matches && setOpen(false);
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);
    return () => {
      root.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);
  const links = [["how", t.nav.how], ["features", t.nav.features], ["demo", t.nav.demo], ["pricing", t.nav.pricing], ["technicians", t.nav.techs], ["vision", t.nav.vision]] as const;
  const iconBtn = "grid size-11 place-items-center rounded-full border border-border bg-card/60 transition-colors hover:bg-secondary";
  return (
    <>
    {/* Tap outside the open phone menu to close it. */}
    {open && <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
    <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${scrolled || open ? "glass !rounded-none !border-x-0 !border-t-0" : ""}`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 btn btn-primary">{t.nav.skip}</a>
      <div className="scroll-progress" aria-hidden />
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8" aria-label={t.a11y.mainNav}>
        <Logo intro />
        <ul className="hidden items-center gap-1 lg:flex">
          {links.map(([id, l]) => (
            <li key={id}><a href={`#${id}`} className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">{l}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <LanguageMenu />
          <button className={iconBtn} onClick={() => setDark(!dark)} aria-label={t.nav.theme}>
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {/* Signed in: avatar menu. Signed out: Sign up. Hidden (but sized) until the saved account is read, so it never flashes. */}
          {account ? (
            <div className="hidden sm:block"><AccountMenu /></div>
          ) : (
            <a href="/signup" className={`btn btn-primary hidden sm:inline-flex ${loaded ? "" : "invisible"}`} aria-hidden={!loaded} tabIndex={loaded ? undefined : -1}>{t.nav.signup}</a>
          )}
          <button className={`${iconBtn} lg:hidden`} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="phone-menu" aria-label={open ? t.nav.close : t.nav.menu}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <ul id="phone-menu" className="mx-auto grid max-h-[calc(100dvh-4rem)] max-w-6xl gap-1 overflow-y-auto overscroll-contain px-5 pb-5 lg:hidden">
          {links.map(([id, l]) => (
            <li key={id}><a onClick={() => setOpen(false)} href={`#${id}`} className="block rounded-xl px-3 py-3 font-medium hover:bg-secondary">{l}</a></li>
          ))}
          {account ? (
            <>
              <li className="mt-2 rounded-2xl border border-border bg-card p-3">
                <AccountSummary account={account} />
                <p className="label-mono mt-2 text-[0.66rem] text-muted-foreground">{t.auth.account.demo}</p>
              </li>
              <li>
                <button type="button" onClick={() => { signOut(); setOpen(false); }} className="btn btn-ghost w-full">
                  <LogOut className="size-4 rtl:rotate-180" aria-hidden />
                  {t.auth.account.signOut}
                </button>
              </li>
            </>
          ) : (
            <>
              <li><a href="/signup" className="btn btn-primary mt-2 w-full">{t.nav.signup}</a></li>
              <li><a href="/signup/business" className="btn btn-ghost w-full">{t.nav.business}</a></li>
            </>
          )}
        </ul>
      )}
    </header>
    </>
  );
}
