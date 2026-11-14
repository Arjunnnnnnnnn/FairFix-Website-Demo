import { useEffect, useRef, useState } from "react";
import { AlertTriangle, BadgeCheck, CheckCircle2, Clock, History, ImageUp, Lock, Mic, RotateCcw, ScanLine, ShieldAlert, ShieldCheck, Sparkles, Square, Star, Wrench } from "lucide-react";
import { useT } from "@/lib/prefs";
import { tx } from "@/lib/dict";
import { jobPrices, problems, technicians, type Problem, type Technician, type Urgency } from "@/data/demo";
import { diagnosePhoto, MAX_NOTE, type AiDiagnosis, type DiagnoseInput, type DiagnoseResponse } from "@/lib/diagnose";
import { langInfo } from "@/lib/langs";
import type { Dict } from "@/lib/i18n";
import { useSpeech } from "@/lib/useSpeech";
import { QrCode } from "./QrCode";
import { CountUp } from "./motion";
import { Heading, Section } from "./Section";

const urgencyStyle: Record<Urgency, { cls: string; Icon: typeof Clock }> = {
  safe: { cls: "bg-safe/15 text-safe", Icon: CheckCircle2 },
  today: { cls: "bg-today/15 text-today", Icon: Clock },
  danger: { cls: "bg-danger/15 text-danger", Icon: AlertTriangle },
};

/** "describe" = no photo: the resident speaks or types what is wrong. */
type Phase = "idle" | "preview" | "describe" | "choose" | "analyzing" | "done";
type View = { kind: "sample"; problem: Problem } | { kind: "ai"; ai: AiDiagnosis };
type ScanError = Exclude<DiagnoseResponse, { ok: true }>["error"];

/** Downsizes a photo in the browser and returns JPEG base64, so uploads stay small and fast. */
async function toJpegBase64(file: File, maxSide = 1280): Promise<Pick<DiagnoseInput, "imageBase64" | "mediaType">> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { imageBase64: dataUrl.slice(dataUrl.indexOf(",") + 1), mediaType: "image/jpeg" };
}

/** Takes a still frame from a short video (about 1 second in) so the AI can look at it. */
async function frameFromVideo(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () => reject(new Error("video"));
      setTimeout(() => reject(new Error("timeout")), 8000);
    });
    const at = Math.min(1, (video.duration || 0) / 2);
    if (at > 0) {
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
        video.currentTime = at;
      });
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx || !canvas.width) throw new Error("frame");
    ctx.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9));
    if (!blob) throw new Error("frame");
    return new File([blob], "video-frame.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function Demo() {
  const { t, lang } = useT();
  const [phase, setPhase] = useState<Phase>("idle");
  const [view, setView] = useState<View | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState<{ kind: ScanError; detail?: string | undefined } | null>(null);
  const [step, setStep] = useState(0);
  const [booked, setBooked] = useState(false);
  const [fromVideo, setFromVideo] = useState(false);
  const [needText, setNeedText] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Voice input: each finished phrase is added to the description, in the site's current language.
  const speech = useSpeech({
    lang: langInfo(lang).speech,
    onFinal: (text) => {
      setNeedText(false);
      setNote((n) => `${n.trimEnd()}${n.trim() ? " " : ""}${text}`.slice(0, MAX_NOTE));
    },
  });
  const resultRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  const scrollToResult = () => {
    if (window.innerWidth < 1024) setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  // Progress ticks while analysing. Samples finish on a timer; AI scans finish when the server answers.
  useEffect(() => {
    if (phase !== "analyzing") return;
    const ids = [setTimeout(() => setStep(1), 600), setTimeout(() => setStep(2), 1400)];
    if (view?.kind === "sample") ids.push(setTimeout(() => setPhase("done"), 1900));
    return () => ids.forEach(clearTimeout);
  }, [phase, view]);

  const runSample = (p: Problem) => {
    requestId.current++;
    setView({ kind: "sample", problem: p }); setImage(p.image); setFile(null); setError(null);
    setBooked(false); setStep(0); setPhase("analyzing");
    scrollToResult();
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    const isVideo = f.type.startsWith("video/");
    if (!isVideo && !f.type.startsWith("image/")) return;
    const id = ++requestId.current;
    let photo = f;
    if (isVideo) {
      try {
        photo = await frameFromVideo(f);
      } catch {
        // Couldn't read the video: offer the description route instead.
        if (id !== requestId.current) return;
        setImage(null); setFile(null); setFromVideo(false); setView(null); setError({ kind: "invalid_image" }); setPhase("describe");
        scrollToResult();
        return;
      }
      if (id !== requestId.current) return;
    }
    setImage(URL.createObjectURL(photo)); setFile(photo); setFromVideo(isVideo); setView(null); setError(null); setNeedText(false); setNote(""); setBooked(false); setPhase("preview");
    scrollToResult();
  };

  const startDescribe = () => {
    requestId.current++;
    setImage(null); setFile(null); setFromVideo(false); setView(null); setError(null); setNeedText(false); setBooked(false); setPhase("describe");
    scrollToResult();
  };

  const scan = async () => {
    // Without a photo the AI needs a description to work from.
    if (!file && note.trim().length < 5) {
      setNeedText(true);
      document.getElementById("scan-note")?.focus();
      return;
    }
    speech.stop();
    const id = ++requestId.current;
    const photo = file;
    setError(null); setNeedText(false); setView(null); setBooked(false); setStep(0); setPhase("analyzing");
    const res = await (async (): Promise<DiagnoseResponse> => {
      let img: Awaited<ReturnType<typeof toJpegBase64>> | null = null;
      if (photo) {
        try {
          img = await toJpegBase64(photo);
        } catch {
          return { ok: false, error: "invalid_image" }; // the browser couldn't decode the photo
        }
      }
      try {
        return await diagnosePhoto({ data: { ...(img ?? {}), lang, note } });
      } catch {
        return { ok: false, error: "failed" };
      }
    })();
    if (id !== requestId.current) return; // the visitor moved on; ignore a late answer
    if (res.ok) {
      setView({ kind: "ai", ai: res.result }); setStep(3); setPhase("done");
    } else if (!photo) {
      setError({ kind: res.error, detail: res.message }); setPhase("describe");
    } else if (res.error === "not_repair" || res.error === "invalid_image") {
      setError({ kind: res.error, detail: res.message }); setPhase("preview");
    } else {
      setError({ kind: res.error }); setPhase("choose");
    }
  };

  const reset = () => {
    requestId.current++; setPhase("idle"); setView(null); setError(null);
    // Phones: the result card closes, so bring the picker back into view.
    if (window.innerWidth < 1024) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("demo")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    }
  };

  const activeSample = view?.kind === "sample" ? view.problem.id : null;

  return (
    <Section id="demo" ink>
      <Heading index="03" ink eyebrow={t.demo.eyebrow} title={t.demo.title} sub={t.demo.sub} />
      <div className="reveal grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        {/* picker */}
        <div className="card-ink !transform-none p-5 sm:p-6">
          <button
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); void onFile(e.dataTransfer.files[0]); }}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-ink-border p-8 text-center transition-colors hover:border-accent hover:bg-ink"
          >
            <span className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground"><ImageUp className="size-6" aria-hidden /></span>
            {/* Touch screens get "Take or upload": the phone's chooser offers the camera and the gallery. */}
            <span className="font-display font-semibold pointer-coarse:hidden">{t.demo.upload}</span>
            <span className="hidden font-display font-semibold pointer-coarse:inline">{t.demo.uploadTouch}</span>
            <span className="text-sm text-ink-muted">{t.demo.uploadHint}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ""; }} />
          {/* Voice-first route: no photo needed, speak or type in any of the six languages. */}
          <button
            type="button" onClick={startDescribe} aria-pressed={phase === "describe"}
            className={`mt-3 flex w-full items-center gap-3 rounded-2xl border p-4 text-start transition-colors hover:border-accent hover:bg-ink ${phase === "describe" ? "border-accent ring-2 ring-accent" : "border-ink-border"}`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Mic className="size-5" aria-hidden /></span>
            <span className="min-w-0">
              <span className="block font-display font-semibold">{t.demo.describeBtn}</span>
              <span className="block text-sm text-ink-muted">{t.demo.describeHint}</span>
            </span>
          </button>
          <p className="my-5 text-center text-sm text-ink-muted">{t.demo.or}</p>
          <div className="grid grid-cols-2 gap-3">
            {problems.map((p) => {
              const active = activeSample === p.id;
              return (
                <button key={p.id} onClick={() => runSample(p)} aria-pressed={active}
                  className={`group overflow-hidden rounded-2xl border text-start transition-[border-color,transform] hover:-translate-y-0.5 ${active ? "border-accent ring-2 ring-accent" : "border-ink-border hover:border-ink-muted"}`}>
                  <img src={p.image} alt="" width={400} height={300} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <span className={`block px-3 py-2.5 text-sm font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-ink"}`}>{tx(p.label, lang)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* result */}
        <div ref={resultRef} className={`scroll-mt-24 overflow-hidden rounded-3xl bg-background text-foreground shadow-[var(--shadow-lift)] ${phase === "idle" ? "hidden lg:block" : ""}`} aria-live="polite">
          {phase === "preview" && image ? (
            <div>
              <img src={image} alt={t.demo.upload} className="h-56 w-full object-cover sm:h-64" />
              <div className="space-y-4 p-5 sm:p-7">
                {error && (
                  <p className="flex gap-2 rounded-xl bg-secondary p-3 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden />
                    <span>{t.demo.errors[error.kind]}{error.detail ? ` ${error.detail}` : ""}</span>
                  </p>
                )}
                {fromVideo && <p className="rounded-xl bg-secondary p-3 text-sm text-muted-foreground">{t.demo.videoNote}</p>}
                <NoteField label={t.demo.noteLabel} placeholder={t.demo.notePlaceholder} rows={2} value={note} onChange={setNote} speech={speech} />
                <button onClick={scan} className="btn btn-primary w-full"><Sparkles className="size-4" aria-hidden />{t.demo.scanBtn}</button>
                <button onClick={() => fileRef.current?.click()} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-text hover:underline">
                  <ImageUp className="size-4" aria-hidden />{t.demo.changePhoto}
                </button>
              </div>
            </div>
          ) : phase === "describe" ? (
            <div>
              <NoPhotoVisual />
              <div className="space-y-4 p-5 sm:p-7">
                {error && (
                  <p className="flex gap-2 rounded-xl bg-secondary p-3 text-sm">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-brand-text" aria-hidden />
                    <span>{t.demo.errors[error.kind]}{error.detail ? ` ${error.detail}` : ""}</span>
                  </p>
                )}
                <NoteField
                  big label={t.demo.describeTitle} hint={t.demo.describeSub} placeholder={t.demo.describePlaceholder} rows={4}
                  value={note} onChange={(v) => { setNote(v); setNeedText(false); }} speech={speech} invalid={needText}
                />
                {needText && <p className="text-sm font-medium text-danger">{t.demo.needText}</p>}
                <button onClick={scan} className="btn btn-primary w-full"><Sparkles className="size-4" aria-hidden />{t.demo.diagnoseText}</button>
              </div>
            </div>
          ) : phase === "choose" && image ? (
            <div>
              <img src={image} alt={t.demo.upload} className="h-56 w-full object-cover sm:h-64" />
              <div className="space-y-4 p-5 sm:p-7">
                <p className="rounded-xl bg-secondary p-3 text-sm text-muted-foreground">{error ? t.demo.errors[error.kind] : t.demo.uploadedNote}</p>
                <div>
                  <h3 className="text-2xl font-bold">{t.demo.chooseTitle}</h3>
                  <p className="mt-1 text-muted-foreground">{t.demo.chooseSub}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {problems.map((p) => (
                    <button key={p.id} onClick={() => { runSample(p); setImage(image); }} className="btn btn-ghost !rounded-2xl text-sm">{tx(p.label, lang)}</button>
                  ))}
                </div>
              </div>
            </div>
          ) : phase === "analyzing" || phase === "done" ? (
            <div>
              {image ? (
                <div className="relative h-56 overflow-hidden sm:h-64" style={{ ["--scan-h" as string]: "16rem" }}>
                  <img src={image} alt={view?.kind === "sample" ? tx(view.problem.label, lang) : t.demo.upload} className={`size-full object-cover transition-[filter] duration-500 ${phase === "analyzing" ? "brightness-75 saturate-50" : ""}`} />
                  {phase === "analyzing" && (
                    <>
                      <div className="scan-line" aria-hidden />
                      <AnalyzingSteps step={step} className="absolute inset-x-4 bottom-4" />
                    </>
                  )}
                </div>
              ) : (
                <>
                  <NoPhotoVisual quote={note} />
                  {phase === "analyzing" && <AnalyzingSteps step={step} className="m-5 sm:m-7" />}
                </>
              )}
              {phase === "done" && view && <Result view={view} booked={booked} onBook={() => setBooked(true)} onReset={reset} />}
            </div>
          ) : (
            <div className="hidden h-full min-h-[420px] place-items-center p-10 text-center text-muted-foreground lg:grid">
              <div><ScanLine className="mx-auto mb-3 size-10 text-brand-text" aria-hidden />{t.demo.empty}</div>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

/** One shape for both pre-written samples and live AI scans. */
type ResultModel = {
  badge: string;
  jobLabel?: string | undefined;
  title: string;
  detail: string;
  confidence: number;
  urgency: Urgency;
  priceMin: number;
  priceMax: number;
  priceTag: string;
  priceNote?: string | undefined;
  diy: boolean;
  steps: string[];
  safety?: string | undefined;
  disclaimer?: string | undefined;
  technician: Technician;
};

function useResultModel(view: View): ResultModel {
  const { t, lang } = useT();
  if (view.kind === "sample") {
    const p = view.problem;
    return {
      badge: t.demo.sampleBadge, title: tx(p.diagnosis, lang), detail: tx(p.detail, lang), confidence: p.confidence, urgency: p.urgency,
      priceMin: p.priceMin, priceMax: p.priceMax, priceTag: t.demo.sample, diy: p.diy, steps: p.tips.map((x) => tx(x, lang)), technician: p.technician,
    };
  }
  const a = view.ai;
  const job = a.jobType !== "other" ? jobPrices[a.jobType] : null;
  return {
    badge: t.demo.aiBadge, jobLabel: tx(job?.label, lang), title: a.title, detail: a.explanation, confidence: a.confidence, urgency: a.urgency,
    priceMin: a.priceMin, priceMax: a.priceMax,
    priceTag: a.priceSource === "table" ? t.demo.sample : t.demo.aiEstimate,
    priceNote: a.priceSource === "table" ? t.demo.tableNote : t.demo.estimateNote,
    diy: a.diy, steps: a.steps, safety: a.safetyWarning || undefined, disclaimer: t.demo.aiDisclaimer,
    technician: technicians[job?.trade ?? "handy"],
  };
}

function Result({ view, booked, onBook, onReset }: { view: View; booked: boolean; onBook: () => void; onReset: () => void }) {
  const { t, lang } = useT();
  const m = useResultModel(view);
  const u = urgencyStyle[m.urgency];
  const tech = m.technician;
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-5 p-5 duration-500 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 normal-case tracking-normal ${view.kind === "ai" ? "bg-primary text-primary-foreground" : "border border-border"}`}>
              {view.kind === "ai" && <Sparkles className="size-3" aria-hidden />}{m.badge}
            </span>
            <span>{t.demo.diagnosis} · <span className="tabular-nums">{m.confidence}%</span> {t.demo.confidence}</span>
          </p>
          <h3 className="mt-2 text-2xl font-bold">{m.title}</h3>
          {m.jobLabel && <p className="mt-1 text-sm text-muted-foreground">{t.demo.jobType}: {m.jobLabel}</p>}
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${u.cls}`}><u.Icon className="size-4" aria-hidden />{t.demo.urgency[m.urgency]}</span>
      </div>
      <p className="text-muted-foreground">{m.detail}</p>

      {m.safety && (
        <p className="flex gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          <span><span className="font-semibold">{t.demo.safety}:</span> {m.safety}</span>
        </p>
      )}

      <div className="rounded-2xl bg-secondary p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{t.demo.fair}</p>
            <p className="whitespace-nowrap font-display text-3xl font-bold tabular-nums" dir="ltr">
              {/* Animated digits are hidden from screen readers; the final value is read once. */}
              <span aria-hidden="true"><CountUp to={m.priceMin} />–<CountUp to={m.priceMax} /> <span className="text-base text-muted-foreground">QAR</span></span>
              <span className="sr-only">{m.priceMin}–{m.priceMax} QAR</span>
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">{m.priceTag}</span>
        </div>
        {m.priceNote && <p className="mt-2 text-xs text-muted-foreground">{m.priceNote}</p>}
      </div>

      {m.steps.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-2 font-display font-semibold"><Wrench className="size-4 text-brand-text" aria-hidden />{m.diy ? t.demo.diyTitle : t.demo.waitTitle}</p>
          <ol className="space-y-2">
            {m.steps.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>{tip}</li>
            ))}
          </ol>
        </div>
      )}

      {!booked ? (
        <button onClick={onBook} className={`btn w-full ${m.diy ? "btn-ghost" : "btn-primary"}`}>{m.diy ? t.demo.alsoBook : t.demo.book}</button>
      ) : (
        <div className="animate-in fade-in zoom-in-95 space-y-3 duration-300">
          <p className="flex items-center gap-2 rounded-xl bg-primary p-3 text-sm font-semibold text-primary-foreground"><Lock className="size-4" aria-hidden />{t.demo.booked}</p>
          <JobTracker tech={tech} priceMin={m.priceMin} priceMax={m.priceMax} />
          <p className="text-xs text-muted-foreground">{t.demo.lockNote}</p>
        </div>
      )}
      {m.disclaimer && <p className="text-xs text-muted-foreground">{m.disclaimer}</p>}
      <button onClick={onReset} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-text hover:underline"><RotateCcw className="size-4" aria-hidden />{t.demo.reset}</button>
    </div>
  );
}

/** "Analyzing your photo…" with three steps that tick off. */
function AnalyzingSteps({ step, className }: { step: number; className: string }) {
  const { t } = useT();
  return (
    <div className={`glass rounded-2xl p-4 ${className}`}>
      <p className="font-display font-semibold">{t.demo.analyzing}</p>
      <ul className="mt-2 space-y-1 text-sm">
        {t.demo.steps.map((s, i) => (
          <li key={s} className={`flex items-center gap-2 transition-opacity ${i <= step ? "opacity-100" : "opacity-40"}`}>
            <CheckCircle2 className={`size-4 ${i < step ? "text-brand-text" : "text-muted-foreground"}`} aria-hidden />{s}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Header for the description-only route, quoting what the resident said once there is something. */
function NoPhotoVisual({ quote }: { quote?: string }) {
  const { t } = useT();
  return (
    <div className="relative grid h-40 place-items-center overflow-hidden bg-maroon-gradient px-6 text-center text-primary-foreground sm:h-44">
      <div className="pattern-layer [--pattern-color:oklch(1_0_0/8%)]" aria-hidden />
      <div className="relative max-w-md">
        <Mic className="mx-auto size-8 opacity-90" aria-hidden />
        <p className="label-mono mt-2 opacity-80">{t.demo.noPhoto}</p>
        {quote?.trim() && <p className="mt-2 line-clamp-2 text-sm italic opacity-90">"{quote.trim()}"</p>}
      </div>
    </div>
  );
}

/** Description box with a Speak button. Speech is recognised in the site's current language. */
function NoteField({
  label, hint, placeholder, rows, value, onChange, speech, invalid, big,
}: {
  label: string; hint?: string; placeholder: string; rows: number; value: string; onChange: (v: string) => void;
  speech: ReturnType<typeof useSpeech>; invalid?: boolean; big?: boolean;
}) {
  const { t } = useT();
  const status =
    speech.status === "listening" ? t.demo.listening
    : speech.status === "blocked" ? t.demo.voiceBlocked
    : speech.status === "unsupported" ? t.demo.voiceUnsupported
    : speech.status === "nospeech" ? t.demo.voiceNoSpeech
    : "";
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="scan-note" className={big ? "font-display text-2xl font-bold" : "text-sm font-semibold"}>{label}</label>
        <button
          type="button" onClick={speech.listening ? speech.stop : speech.start} aria-pressed={speech.listening}
          className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${
            speech.listening ? "bg-danger text-background" : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {speech.listening ? <Square className="size-3.5 fill-current" aria-hidden /> : <Mic className="size-4" aria-hidden />}
          {speech.listening ? t.demo.micStop : t.demo.mic}
          {speech.listening && (
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full rounded-full bg-background opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-background" />
            </span>
          )}
        </button>
      </div>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <textarea
        id="scan-note" name="scan-note" rows={rows} maxLength={MAX_NOTE} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete="off" aria-invalid={invalid || undefined} aria-describedby="scan-note-status"
        className={`mt-2 block w-full resize-none rounded-xl border bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground ${invalid ? "border-danger" : "border-input"}`}
      />
      <p id="scan-note-status" role="status" className="mt-1.5 min-h-5 text-sm text-muted-foreground">
        {status}
        {speech.interim && <span className="italic"> "{speech.interim}"</span>}
      </p>
    </div>
  );
}

type JobEventKey = keyof Dict["demo"]["job"]["ev"];
type JobEvent = { key: JobEventKey; at: number; price?: string };
const GUARANTEE_DAYS = 30;
const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");

/**
 * What happens after booking, simulated step by step: scan the technician's QR at the door,
 * approve or decline extra work (the quote is locked otherwise), mark the job fixed, then the
 * re-fix guarantee. Every step lands in a time-stamped dispute trail.
 */
function JobTracker({ tech, priceMin, priceMax }: { tech: Technician; priceMin: number; priceMax: number }) {
  const { t, lang } = useT();
  const j = t.demo.job;
  const [verified, setVerified] = useState(false);
  const [extra, setExtra] = useState<"ask" | "approved" | "declined">("ask");
  const [fixedAt, setFixedAt] = useState<number | null>(null);
  const [refix, setRefix] = useState(false);
  const [events, setEvents] = useState<JobEvent[]>(() => {
    const now = Date.now();
    return [{ key: "booked", at: now }, { key: "quote", at: now, price: `${priceMin}–${priceMax} QAR` }];
  });
  const log = (key: JobEventKey, price?: string) => setEvents((ev) => [...ev, price ? { key, at: Date.now(), price } : { key, at: Date.now() }]);
  const extraPrice = Math.max(20, Math.round((priceMin * 0.2) / 5) * 5);
  const intl = langInfo(lang).intl;
  const time = new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit" });
  const date = new Intl.DateTimeFormat(intl, { day: "numeric", month: "long", year: "numeric" });
  const fixed = fixedAt !== null;
  const stepDone = [true, true, fixed, fixed];

  return (
    <div className="space-y-3">
      {/* Technician and the QR identity check at the door */}
      <div className="card-premium p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-maroon-gradient font-display text-lg font-bold text-primary-foreground" aria-hidden>{tech.initials}</div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t.demo.tech}</p>
            <p className="flex items-center gap-1 font-display font-bold" translate="no">{tech.name}<BadgeCheck className="size-4 text-brand-text" aria-label={t.a11y.verified} /></p>
            <p className="truncate text-sm text-muted-foreground" translate="no">{tech.company}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-0.5 font-semibold text-foreground"><Star className="size-3.5 fill-current text-brand-text" aria-hidden />{tech.rating}</span>
              <span className="tabular-nums">{tech.jobs} {t.demo.jobs}</span>·<span>{tech.trades.map((x) => tx(x, lang)).join(", ")}</span>
            </p>
          </div>
        </div>
        {!verified ? (
          <div className="mt-4 flex items-center gap-4 border-t border-border pt-4">
            <QrCode seed={tech.id} size={80} label={`${t.a11y.qr} ${tech.name}`} />
            <div className="min-w-0 space-y-2">
              <p className="text-xs text-muted-foreground">{t.demo.scan}</p>
              <button type="button" onClick={() => { setVerified(true); log("verified"); }} className="btn btn-primary min-h-11 px-4 text-sm">
                <ScanLine className="size-4" aria-hidden />{j.verifyBtn}
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in mt-4 rounded-2xl border border-safe/40 bg-safe/10 p-3 duration-300">
            <p className="flex items-center gap-2 font-semibold text-safe"><ShieldCheck className="size-5" aria-hidden />{j.verified}</p>
            <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">{j.company}</dt><dd className="font-medium" translate="no">{tech.company}</dd>
              <dt className="text-muted-foreground">{j.trades}</dt><dd className="font-medium">{tech.trades.map((x) => tx(x, lang)).join(", ")}</dd>
              <dt className="text-muted-foreground">{j.licence}</dt><dd className="font-medium" translate="no" dir="ltr">{tech.licence.split(" ").pop()}</dd>
              <dt className="text-muted-foreground">{j.rating}</dt><dd className="font-medium tabular-nums">{tech.rating} · {tech.jobs} {t.demo.jobs}</dd>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">{j.verifyNote}</p>
          </div>
        )}
      </div>

      {/* Job tracker: locked quote, extra work needs approval, fixed, guarantee */}
      <div className="card-premium space-y-4 p-4">
        <p className="label-mono text-muted-foreground">{j.tracker}</p>
        <ol className="grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-4">
          {t.features.timeline.map((label, i) => (
            <li key={label}>
              <div className={`h-1 rounded-full transition-colors duration-300 ${stepDone[i] ? "bg-primary" : "bg-border"}`} aria-hidden />
              <p className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${stepDone[i] ? "" : "text-muted-foreground"}`}>
                {stepDone[i] && <CheckCircle2 className="size-3.5 text-brand-text" aria-hidden />}{label}
              </p>
            </li>
          ))}
        </ol>
        {verified && extra === "ask" && (
          <div className="animate-in fade-in rounded-2xl bg-secondary p-3 duration-300">
            <p className="text-sm">
              {fill(j.extraAsk, { item: j.extraItem })} <span dir="ltr" className="font-semibold tabular-nums">+{extraPrice} QAR</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => { setExtra("approved"); log("extraApproved", `+${extraPrice} QAR`); }} className="btn btn-primary min-h-11 px-4 text-sm">{j.approve}</button>
              <button type="button" onClick={() => { setExtra("declined"); log("extraDeclined"); }} className="btn btn-ghost min-h-11 px-4 text-sm">{j.decline}</button>
            </div>
          </div>
        )}
        {!fixed ? (
          <button
            type="button" disabled={!verified || extra === "ask"} onClick={() => { setFixedAt(Date.now()); log("fixed"); }}
            className="btn btn-ghost w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="size-4" aria-hidden />{j.markFixed}
          </button>
        ) : (
          <div className="animate-in fade-in space-y-2 duration-300">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 shrink-0 text-brand-text" aria-hidden />
              {fill(j.guaranteeUntil, { date: date.format(fixedAt + GUARANTEE_DAYS * 86_400_000) })}
            </p>
            <p className="text-xs text-muted-foreground">{j.fixedNote}</p>
            {!refix ? (
              <button type="button" onClick={() => { setRefix(true); log("refix"); }} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-text hover:underline">
                <RotateCcw className="size-4" aria-hidden />{j.refix}
              </button>
            ) : (
              <p className="rounded-xl bg-primary/10 p-3 text-sm">{j.refixSent}</p>
            )}
          </div>
        )}
      </div>

      {/* Dispute trail: every step, time-stamped */}
      <div className="card-premium p-4">
        <p className="flex items-center gap-2 font-display font-semibold"><History className="size-4 text-brand-text" aria-hidden />{j.trail}</p>
        <p className="mt-1 text-xs text-muted-foreground">{j.trailNote}</p>
        <ol className="mt-3 space-y-2 border-s-2 border-border ps-4">
          {events.map((e, i) => (
            <li key={i} className="relative text-sm">
              <span className="absolute -start-[21px] top-1.5 size-2.5 rounded-full bg-primary" aria-hidden />
              <span className="label-mono me-2 text-muted-foreground tabular-nums" dir="ltr">{time.format(e.at)}</span>
              {fill(j.ev[e.key], { price: e.price ?? "" })}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
