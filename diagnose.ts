import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { JobKey, Urgency } from "@/data/demo";
import type { Lang } from "@/lib/langs";

/** A photo, a description, or both. Voice input arrives here as text in the resident's language. */
export type DiagnoseInput = {
  imageBase64?: string | undefined;
  mediaType?: "image/jpeg" | "image/png" | "image/webp" | undefined;
  lang: Lang;
  note: string;
};

export type AiDiagnosis = {
  jobType: JobKey | "other";
  title: string;
  explanation: string;
  confidence: number;
  urgency: Urgency;
  diy: boolean;
  steps: string[];
  safetyWarning: string;
  priceMin: number;
  priceMax: number;
  /** "table" = from the sample price table in demo.ts; "ai_estimate" = Claude's estimate for an unlisted job. */
  priceSource: "table" | "ai_estimate";
};

export type DiagnoseResponse =
  | { ok: true; result: AiDiagnosis }
  | { ok: false; error: "not_configured" | "rate_limited" | "invalid_image" | "failed" | "not_repair"; message?: string };

/** ~3 MB of base64 ≈ a 2.2 MB image; the browser downsizes photos well below this first. */
const MAX_BASE64_LENGTH = 3_000_000;

/** Long enough for a spoken description of the problem. */
export const MAX_NOTE = 600;

const inputSchema = z
  .object({
    imageBase64: z.string().min(100).max(MAX_BASE64_LENGTH).regex(/^[A-Za-z0-9+/=]+$/).optional(),
    mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]).optional(),
    lang: z.enum(["en", "ar", "hi", "ur", "ml", "tl"]),
    note: z.string().max(MAX_NOTE),
  })
  .refine((d) => (d.imageBase64 && d.mediaType) || d.note.trim().length >= 5, { message: "Send a photo or describe the problem" });

/** Diagnoses a home-repair photo and/or description with Claude. Runs on the server; the API key never reaches the browser. */
export const diagnosePhoto = createServerFn({ method: "POST" })
  .validator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<DiagnoseResponse> => {
    const [{ runDiagnosis }, { getRequestHeader, getRequestIP }] = await Promise.all([
      import("@/server/diagnose.server"),
      import("@tanstack/react-start/server"),
    ]);
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestIP({ xForwardedFor: true }) ?? "unknown";
    return runDiagnosis(data, ip);
  });
