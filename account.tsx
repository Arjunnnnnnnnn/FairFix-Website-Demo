import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { PlanId } from "@/data/pricing";
import type { AreaId, BizType, HomeType } from "@/data/signup";

/**
 * Demo sign-in for the prototype. There is no backend: the account lives in this
 * browser's localStorage, so it survives reloads on this device and nowhere else.
 */
export type Account =
  | {
      kind: "resident";
      name: string;
      /** 8 digits, without +974 */
      phone: string;
      area?: AreaId | undefined;
      home?: HomeType | undefined;
      email?: string | undefined;
      plan?: PlanId | undefined;
    }
  | {
      kind: "business";
      type: BizType;
      /** Registered business name */
      name: string;
      contactName: string;
      cr: string;
      partnerId?: string | undefined;
    };

const KEY = "fairfix-account";

type AccountCtx = {
  account: Account | null;
  /** False until the saved account has been read, so the nav can avoid flashing "Sign up". */
  loaded: boolean;
  signIn: (a: Account) => void;
  signOut: () => void;
};
const Ctx = createContext<AccountCtx | null>(null);

function read(): Account | null {
  try {
    const raw = localStorage.getItem(KEY);
    const a = raw ? (JSON.parse(raw) as Account) : null;
    return a && (a.kind === "resident" || a.kind === "business") && typeof a.name === "string" ? a : null;
  } catch {
    return null; // storage blocked or bad JSON: act signed out
  }
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAccount(read());
    setLoaded(true);
    // Keep other open tabs in step when someone signs in or out.
    const onStorage = (e: StorageEvent) => e.key === KEY && setAccount(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback((a: Account) => {
    setAccount(a);
    try {
      localStorage.setItem(KEY, JSON.stringify(a));
    } catch {
      // storage blocked: stay signed in for this visit only
    }
  }, []);

  const signOut = useCallback(() => {
    setAccount(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      // nothing saved to remove
    }
  }, []);

  return <Ctx.Provider value={{ account, loaded, signIn, signOut }}>{children}</Ctx.Provider>;
}

export function useAccount() {
  const c = useContext(Ctx);
  if (!c) throw new Error("AccountProvider missing");
  return c;
}

/** Up to two initials for the avatar: "Aisha Khalid" → "AK", "Frostbyte Demo Cooling Co." → "FD". */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? parts[0]!.charAt(0) + parts[1]!.charAt(0) : (parts[0] ?? "?").slice(0, 2)).toUpperCase();
}

/** Short label for the nav: a resident's first name, or the business name. */
export function displayName(a: Account) {
  return a.kind === "resident" ? (a.name.trim().split(/\s+/)[0] ?? a.name) : a.name;
}
