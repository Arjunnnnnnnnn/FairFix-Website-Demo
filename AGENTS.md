<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- All demo content (problems, job price table, technicians, team info, app name) lives in `src/data/demo.ts`; resident plan prices, features and the plan comparison live in `src/data/pricing.ts`; UI copy lives in six languages: English and Arabic in `src/lib/i18n.ts`, Hindi, Urdu, Malayalam and Tagalog in `src/lib/locales/*.ts` (typed as `Dict`, so a missing key fails the type check). Data labels in `src/data` stay `{ en, ar }`; the other four languages translate them in each locale's `…Data` map keyed by the exact English text, read through `tx()` from `src/lib/dict.ts`. When you add or change copy, update all six. The language list (names, text direction, voice and number codes) is `src/lib/langs.ts`; Arabic and Urdu are right to left.
- Sign-up lives at `/signup` (residents: phone number, then a placeholder 6-digit code; any digits pass) and `/signup/business` (maintenance partners and property businesses). Both are front-end only: no SMS or uploads. A finished sign-up is a demo session saved in this browser's localStorage (`src/lib/account.tsx`, `AccountProvider` in `__root.tsx`); the nav shows it with a sign-out menu. The business form has "Fill sample details" / "Skip to approval" demo bypasses. Option lists and sample details live in `src/data/signup.ts`.
- Voice input uses the browser's speech recognition (`src/lib/useSpeech.ts`) in the site's current language. The AI scan (`src/lib/diagnose.ts`, `src/server/diagnose.server.ts`) takes a photo, a still frame from a video, or a description alone, and answers in any of the six languages.
- Language and dark mode are client state in `src/lib/prefs.tsx` (first visit picks the phone's language when it's one of the six); `PrefsProvider` wraps every route in `__root.tsx`, and each page sets its tab title with `usePageTitle` (sets `dir`/`lang`/`.dark` on `<html>`); use logical Tailwind utilities (`ps-`, `start-`, `text-start`) so RTL works.
- Keep the theme-aware inline brand icon in one shared component for nav/footer; derive browser icons from the supplied raster to preserve the original artwork.
- Separate brand-fill tokens from theme-aware brand-text tokens so dark-surface readability never changes the logo or filled controls' pigment.
