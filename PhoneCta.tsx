import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";
import { useT } from "@/lib/prefs";
import { useAccount } from "@/lib/account";

/**
 * Phones only: a thumb-reach "Try the AI demo" bar pinned to the bottom of the screen.
 * It hides while the hero, the demo itself, the final call-to-action or the footer is on
 * screen, so it never covers the buttons it duplicates.
 */
export function PhoneCta() {
  const { t } = useT();
  const { account, loaded } = useAccount();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const targets = [
      document.getElementById("top"),
      document.getElementById("demo"),
      document.getElementById("contact"),
      document.querySelector("footer"),
    ].filter((el): el is HTMLElement => el !== null);
    const onScreen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)));
      setHidden(onScreen.size > 0);
    });
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div
      data-hidden={hidden}
      inert={hidden}
      className="mobile-cta fixed inset-x-3 z-30 sm:hidden"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="glass flex items-center gap-1.5 rounded-full p-1.5 shadow-[var(--shadow-lift)]">
        <a href="#demo" className="btn btn-primary flex-1">
          <ScanLine className="size-4" aria-hidden />
          {t.hero.cta1}
        </a>
        {loaded && !account && <a href="/signup" className="btn btn-ghost px-4">{t.nav.signup}</a>}
      </div>
    </div>
  );
}
