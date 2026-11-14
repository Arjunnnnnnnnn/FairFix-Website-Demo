import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Voice input through the browser's built-in speech recognition (Chrome, Edge, Safari; not Firefox).
 * Listens in the given language (a BCP 47 code such as "ml-IN") and hands each finished phrase to
 * `onFinal`; `interim` shows the words as they're being recognised.
 */
export type SpeechStatus = "idle" | "listening" | "unsupported" | "blocked" | "nospeech";

type Alternative = { transcript: string };
type Result = ArrayLike<Alternative> & { isFinal: boolean };
type ResultEvent = { resultIndex: number; results: ArrayLike<Result> };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: ResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeech({ lang, onFinal }: { lang: string; onFinal: (text: string) => void }) {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [interim, setInterim] = useState("");
  const rec = useRef<Recognition | null>(null);
  const onFinalRef = useRef(onFinal);
  useEffect(() => {
    onFinalRef.current = onFinal;
  });
  // Stop listening if the component goes away or the language changes mid-sentence.
  useEffect(() => () => rec.current?.abort(), [lang]);

  const start = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor) {
      setStatus("unsupported");
      return;
    }
    rec.current?.abort();
    const r = new Ctor();
    r.lang = lang;
    r.interimResults = true;
    r.continuous = false;
    r.maxAlternatives = 1;
    let heard = false;
    r.onresult = (e) => {
      let pending = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res?.[0]?.transcript ?? "";
        if (res?.isFinal) {
          heard = true;
          if (text.trim()) onFinalRef.current(text.trim());
        } else pending += text;
      }
      setInterim(pending);
    };
    r.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setStatus("blocked");
      else if (e.error !== "aborted") setStatus("nospeech");
    };
    r.onend = () => {
      setInterim("");
      setStatus((s) => (s === "listening" ? (heard ? "idle" : "nospeech") : s));
      if (rec.current === r) rec.current = null;
    };
    rec.current = r;
    setStatus("listening");
    try {
      r.start();
    } catch {
      setStatus("nospeech");
    }
  }, [lang]);

  const stop = useCallback(() => rec.current?.stop(), []);
  return { status, interim, listening: status === "listening", start, stop };
}
