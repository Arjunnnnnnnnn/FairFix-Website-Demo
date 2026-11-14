import type { ReactNode } from "react";
import { ChevronDown, LogOut, ScanLine } from "lucide-react";
import { useT } from "@/lib/prefs";
import { isRtl } from "@/lib/langs";
import { tx } from "@/lib/dict";
import { displayName, initials, useAccount, type Account } from "@/lib/account";
import { plans } from "@/data/pricing";
import { formatQaMobile } from "@/data/signup";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Avatar({ account, className = "size-9" }: { account: Account; className?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground ${className}`} aria-hidden translate="no">
      {initials(account.name)}
    </span>
  );
}

/** Avatar, full name and one line saying what kind of account this is. */
export function AccountSummary({ account }: { account: Account }) {
  const { t, lang } = useT();
  const a = t.auth.account;
  let sub: ReactNode;
  if (account.kind === "resident") {
    const plan = plans.find((p) => p.id === account.plan);
    sub = (
      <>
        <span dir="ltr" className="tabular-nums">+974 {formatQaMobile(account.phone)}</span>
        {plan && <> · <span translate={plan.brandName ? "no" : undefined}>{tx(plan.name, lang)}</span></>}
      </>
    );
  } else {
    sub = account.type === "partner"
      ? <>{a.partner} · <span translate="no">{account.partnerId}</span></>
      : <>{a.property} · <span dir="ltr">CR {account.cr}</span></>;
  }
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar account={account} className="size-11 text-sm" />
      <div className="min-w-0">
        <p className="truncate font-semibold rtl:text-right" dir="auto" translate="no">{account.name}</p>
        <p className="truncate text-sm text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

const itemCls = "min-h-11 cursor-pointer gap-2.5 rounded-xl px-3 text-sm font-medium focus:bg-secondary focus:text-foreground";

/** Nav button for a signed-in visitor: avatar and name, opening a menu with sign out. */
export function AccountMenu() {
  const { t, lang } = useT();
  const { account, signOut } = useAccount();
  if (!account) return null;
  const a = t.auth.account;
  return (
    <DropdownMenu dir={isRtl(lang) ? "rtl" : "ltr"} modal={false}>
      <DropdownMenuTrigger
        aria-label={`${a.menu}: ${account.name}`}
        className="inline-flex h-11 max-w-56 items-center gap-2 rounded-full border border-border bg-card/60 ps-1 pe-3 text-sm font-semibold transition-colors hover:bg-secondary data-[state=open]:bg-secondary"
      >
        <Avatar account={account} />
        <span className="truncate" dir="auto" translate="no">{displayName(account)}</span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-72 rounded-2xl border-border bg-card p-2 text-card-foreground shadow-[var(--shadow-lift)]">
        <div className="p-2">
          <AccountSummary account={account} />
          <p className="label-mono mt-3 text-[0.66rem] text-muted-foreground">{a.demo}</p>
        </div>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild className={itemCls}>
          <a href="/#demo"><ScanLine className="size-4 text-brand-text" aria-hidden />{t.hero.cta1}</a>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={signOut} className={itemCls}>
          <LogOut className="size-4 text-brand-text rtl:rotate-180" aria-hidden />
          {a.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
