/**
 * Server-only: sends a resident's photo to Claude and returns a structured repair triage.
 * Imported dynamically from the `diagnosePhoto` server function so the SDK and the API key
 * never reach the browser. The key comes from the ANTHROPIC_API_KEY secret (Lovable → Secrets);
 * for local development put it in `website/.env.local` (git-ignored).
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { JOB_KEYS, jobPrices, type JobKey } from "@/data/demo";
import { MAX_NOTE, type DiagnoseInput, type DiagnoseResponse } from "@/lib/diagnose";
import { langInfo } from "@/lib/langs";

const MODEL = "claude-opus-5-5";

const TriageSchema = z.object({
  is_home_repair_issue: z.boolean(),
  job_type: z.enum([...(JOB_KEYS as [JobKey, ...JobKey[]]), "other"]),
  title: z.string(),
  explanation: z.string(),
  confidence: z.number().int(),
  urgency: z.enum(["safe", "today", "danger"]),
  diy_safe: z.boolean(),
  steps: z.array(z.string()),
  safety_warning: z.string(),
  estimate_min_qar: z.number().int(),
  estimate_max_qar: z.number().int(),
});

const SYSTEM_PROMPT = `You are FairFix's home-repair triage assistant for residents of Qatar. You usually see one photo of a household maintenance problem, sometimes with a note from the resident. Sometimes there is no photo, only the resident's own description (often spoken aloud and transcribed, possibly in Arabic, Hindi, Urdu, Malayalam or Tagalog). Give a careful first diagnosis that helps them decide what to do next.

How to judge:
- Base the diagnosis on what the photo actually shows, or on the description when there is no photo. If it is ambiguous, say what you can and cannot tell, and lower your confidence. Without a photo, keep confidence at 75 or below.
- confidence: 0-100, your honest estimate that the diagnosis is right.
- urgency: "danger" when there is a risk of fire, electric shock, gas, flooding or structural harm and the resident should switch off or isolate now; "today" when it is getting worse or affects comfort or health in Qatar's heat (for example AC failure, an active leak); "safe" when it is cosmetic or slow and can wait for a booked visit.
- diy_safe: true only for simple, low-risk jobs a non-expert can do with basic tools, such as cleaning an AC filter, tightening a sink trap nut, plunging a drain, or resetting a tripped breaker once. Never mark DIY as safe for anything inside an electrical panel or behind a socket, gas, refrigerant, work at height, the inside of a water heater, structural damage, or mould larger than a small patch.
- steps: 2 to 5 short imperative steps. If diy_safe, the safe DIY fix. Otherwise, what to do safely while waiting for a technician.
- safety_warning: one sentence when there is a hazard, otherwise an empty string.
- job_type: the closest type from the list below. Use "other" only when none fits; then put a realistic Doha price range in QAR for labour plus typical minor parts in estimate_min_qar and estimate_max_qar. For any listed type, set both estimates to 0.
- If the photo does not show a home maintenance problem (a person, pet, screenshot, food, landscape...), or the description is not about one, set is_home_repair_issue to false, job_type to "other", explain briefly in a friendly way, leave steps empty and set both estimates to 0.

Write title, explanation, steps and safety_warning in the language the request names. Keep the title under 8 words and the explanation under 45 words. Do not invent brand names, prices for listed types, or details you cannot see.

Job types:
${JOB_KEYS.map((k) => `- ${k}: ${jobPrices[k].label.en} (${jobPrices[k].hint})`).join("\n")}
- other: anything else`;

/* Simple per-IP limit so a public demo can't run up the API bill. Per server instance, best effort. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_SCANS_PER_WINDOW = 8;
const recentScans = new Map<string, number[]>();

function allowScan(ip: string): boolean {
  const now = Date.now();
  const kept = (recentScans.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (kept.length >= MAX_SCANS_PER_WINDOW) {
    recentScans.set(ip, kept);
    return false;
  }
  kept.push(now);
  recentScans.set(ip, kept);
  if (recentScans.size > 5000) recentScans.clear();
  return true;
}

async function apiKeyConfigured(): Promise<boolean> {
  if (!process.env["ANTHROPIC_API_KEY"] && import.meta.env.DEV) {
    // Local dev only: Vite doesn't load non-VITE_ variables, so read .env.local ourselves.
    // (process.loadEnvFile won't replace a variable that already exists but is empty.)
    try {
      const [{ readFileSync }, { parseEnv }] = await Promise.all([import("node:fs"), import("node:util")]);
      const key = parseEnv(readFileSync(".env.local", "utf8"))["ANTHROPIC_API_KEY"];
      if (key) process.env["ANTHROPIC_API_KEY"] = key;
    } catch {
      /* no .env.local: fall through */
    }
  }
  return Boolean(process.env["ANTHROPIC_API_KEY"]);
}

const clampInt = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));

export async function runDiagnosis(input: DiagnoseInput, ip: string): Promise<DiagnoseResponse> {
  if (!(await apiKeyConfigured())) return { ok: false, error: "not_configured" };
  if (!allowScan(ip)) return { ok: false, error: "rate_limited" };

  const client = new Anthropic();
  const language = langInfo(input.lang).english;
  const note = input.note.trim().slice(0, MAX_NOTE);
  const photo = input.imageBase64 && input.mediaType ? { data: input.imageBase64, media_type: input.mediaType } : null;

  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      // If Claude declines on policy grounds, the API retries on its default fallback model in the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(TriageSchema) },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: photo
            ? [
                { type: "image", source: { type: "base64", ...photo } },
                { type: "text", text: `${note ? `Resident's note: "${note}"\n` : ""}Respond in ${language}.` },
              ]
            : [
                {
                  type: "text",
                  text: `No photo. The resident describes the problem in their own words: "${note}"\nDiagnose from this description. Respond in ${language}.`,
                },
              ],
        },
      ],
    });

    if (response.stop_reason === "refusal") return { ok: false, error: "failed" };
    const out = response.parsed_output;
    if (!out) return { ok: false, error: "failed" };

    if (!out.is_home_repair_issue) {
      return { ok: false, error: "not_repair", message: out.explanation };
    }

    const known = out.job_type !== "other" ? jobPrices[out.job_type] : null;
    const min = known ? known.min : clampInt(out.estimate_min_qar, 0, 20000);
    const max = known ? known.max : clampInt(Math.max(out.estimate_max_qar, out.estimate_min_qar), 0, 20000);

    return {
      ok: true,
      result: {
        jobType: out.job_type,
        title: out.title.slice(0, 120),
        explanation: out.explanation.slice(0, 600),
        confidence: clampInt(out.confidence, 0, 100),
        urgency: out.urgency,
        diy: out.diy_safe,
        steps: out.steps.slice(0, 5).map((s) => s.slice(0, 200)),
        safetyWarning: out.safety_warning.slice(0, 300),
        priceMin: min,
        priceMax: max,
        priceSource: known ? "table" : "ai_estimate",
      },
    };
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return { ok: false, error: "rate_limited" };
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic API key was rejected");
      return { ok: false, error: "not_configured" };
    }
    console.error("Diagnosis failed", error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error);
    return { ok: false, error: "failed" };
  }
}
