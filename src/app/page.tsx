"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { Camera, Upload, ShieldCheck, Volume2, Copy, Share2, RotateCcw, AlertTriangle, Check } from "lucide-react";
import type { Explained } from "@/lib/schema";

const STAGES = ["कागज़ पढ़ रहे हैं…", "समझ रहे हैं…", "आसान भाषा में लिख रहे हैं…"];
const ERRORS: Record<string, string> = {
  INVALID_FILE: "यह फ़ाइल नहीं चल सकती। JPG, PNG या WebP फ़ोटो चुनें।",
  FILE_TOO_LARGE: "फ़ोटो बहुत बड़ी है। छोटी फ़ोटो चुनें।",
  OCR_FAILED: "कागज़ पढ़ने में दिक्कत हुई। फिर से कोशिश करें।",
  LOW_QUALITY_IMAGE: "फ़ोटो साफ़ नहीं है। रोशनी में, सीधी फ़ोटो खींचें।",
  LLM_FAILED: "समझाने में दिक्कत हुई। फिर से कोशिश करें।",
  RATE_LIMITED: "बहुत ज़्यादा कोशिशें हुईं। एक मिनट रुककर फिर करें।",
};

async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((ok) => c.toBlob((b) => ok(b!), "image/jpeg", 0.85));
}

const toText = (d: Explained) =>
  [d.documentType, d.summaryHindi, ...d.whatYouNeedToDo.map((x) => "• " + x),
   "ज़रूरी कागज़:", ...d.documentsRequired.map((x) => "• " + x.name)].join("\n");

export default function Home() {
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [data, setData] = useState<Explained | null>(null);
  const [err, setErr] = useState("");
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const pick = useRef<HTMLInputElement>(null);
  const cam = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state !== "working") return;
    setStage(0);
    const t = setInterval(() => setStage((s) => Math.min(s + 1, 2)), 3500);
    return () => clearInterval(t);
  }, [state]);

  async function run(file?: File) {
    if (!file) return;
    setState("working");
    try {
      const fd = new FormData();
      fd.append("file", await shrink(file), "doc.jpg");
      const res = await fetch("/api/analyze", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { setErr(ERRORS[json.error] ?? ERRORS.LLM_FAILED); setState("error"); return; }
      setData(json); setState("done");
    } catch { setErr(ERRORS.OCR_FAILED); setState("error"); }
  }

  function reset() {
    window.speechSynthesis?.cancel();
    setData(null); setDone({}); setErr(""); setState("idle");
  }

  function listen() {
    if (!data) return;
    const u = new SpeechSynthesisUtterance(toText(data));
    u.lang = "hi-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  async function copy() {
    if (!data) return;
    await navigator.clipboard.writeText(toText(data));
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => { run(e.target.files?.[0]); e.target.value = ""; };

  return (
    <MotionConfig reducedMotion="user">
      <main className="mx-auto min-h-screen max-w-2xl px-5 pb-28 pt-10 md:pb-12 md:pt-16">
        <input ref={pick} type="file" accept="image/*" hidden onChange={onFile} />
        <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />

        {state === "idle" && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl font-semibold leading-snug md:text-4xl">सरकारी कागज़ अब आसानी से समझें</h1>
            <p className="mt-3 max-w-md text-ink/70">नोटिस या फ़ॉर्म की फ़ोटो डालें। हम आसान हिंदी में बताएँगे कि क्या करना है और कौन-से कागज़ चाहिए।</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary" onClick={() => pick.current?.click()}><Upload size={20} aria-hidden /> फ़ोटो अपलोड करें</button>
              <button className="btn-ghost" onClick={() => cam.current?.click()}><Camera size={20} aria-hidden /> कैमरे से खींचें</button>
            </div>
            <div className="card mt-10 flex gap-3">
              <ShieldCheck className="mt-1 shrink-0 text-brand" aria-hidden />
              <p>आपका दस्तावेज़ सेव नहीं होता। नतीजा दिखाने के बाद तुरंत हट जाता है। <Link href="/privacy" className="font-semibold text-brand underline">और जानें</Link></p>
            </div>
          </motion.section>
        )}

        {state === "working" && (
          <section className="card mt-16 text-center" aria-live="polite">
            <div className="mx-auto h-2 w-full overflow-hidden rounded-full bg-ink/10">
              <motion.div className="h-full rounded-full bg-saffron" animate={{ width: `${(stage + 1) * 33}%` }} transition={{ duration: 0.6 }} />
            </div>
            <p className="mt-5 font-semibold">{STAGES[stage]}</p>
          </section>
        )}

        {state === "error" && (
          <section className="card mt-16" role="alert">
            <AlertTriangle className="text-saffron" aria-hidden />
            <p className="mt-3">{err}</p>
            <button className="btn-primary mt-5" onClick={reset}><RotateCcw size={20} aria-hidden /> फिर से कोशिश करें</button>
          </section>
        )}

        {state === "done" && data && (
          <motion.div initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.06 } } }} className="space-y-4">
            {[
              <div key="s" className="card">
                <p className="text-sm text-ink/60">{data.documentType}</p>
                <p className="mt-2 text-lg">{data.summaryHindi}</p>
                {data.confidence !== "high" && <p className="mt-3 text-sm text-saffron">कुछ हिस्से साफ़ नहीं थे। नीचे “अस्पष्ट बातें” देखें।</p>}
              </div>,
              <div key="a" className="card"><h2 className="font-semibold">क्या करना है</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">{data.whatYouNeedToDo.map((x, i) => <li key={i}>{x}</li>)}</ul></div>,
              <div key="d" className="card"><h2 className="font-semibold">ज़रूरी कागज़</h2>
                <ul className="mt-2 space-y-2">{data.documentsRequired.map((x, i) => (
                  <li key={i}><label className="flex min-h-[48px] cursor-pointer items-start gap-3">
                    <input type="checkbox" className="mt-2 h-5 w-5 accent-brand" checked={!!done[i]} onChange={() => setDone({ ...done, [i]: !done[i] })} />
                    <span className={done[i] ? "line-through opacity-50" : ""}>{x.name}{x.note && <span className="block text-sm text-ink/60">{x.note}</span>}</span>
                  </label></li>))}</ul></div>,
              <div key="p" className="card"><h2 className="font-semibold">कदम-दर-कदम</h2>
                <ol className="mt-2 space-y-3">{data.stepsHindi.map((x) => (
                  <li key={x.step} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm text-white">{x.step}</span>
                    <p><span className="font-semibold">{x.title}</span><br />{x.detail}</p></li>))}</ol></div>,
              (data.importantDates.length > 0 || data.feesOrCharges || data.whereToSubmit) && (
                <div key="t" className="card space-y-1"><h2 className="font-semibold">तारीख, फ़ीस और कहाँ जमा करें</h2>
                  {data.importantDates.map((x, i) => <p key={i}>{x.label}: <b>{x.date}</b></p>)}
                  {data.feesOrCharges && <p>फ़ीस: {data.feesOrCharges}</p>}
                  {data.whereToSubmit && <p>जमा करें: {data.whereToSubmit}</p>}</div>),
              (data.warnings.length > 0 || data.unclearParts.length > 0) && (
                <div key="w" className="card ring-saffron/50"><h2 className="font-semibold">सावधानी</h2>
                  <ul className="mt-2 list-disc space-y-1 pl-5">{data.warnings.map((x, i) => <li key={i}>{x}</li>)}</ul>
                  {data.unclearParts.length > 0 && <><h3 className="mt-4 font-semibold">अस्पष्ट बातें</h3>
                    <ul className="mt-1 list-disc space-y-1 pl-5">{data.unclearParts.map((x, i) => <li key={i}>{x}</li>)}</ul></>}</div>),
            ].filter(Boolean).map((el, i) => (
              <motion.div key={i} variants={{ hide: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}>{el}</motion.div>
            ))}

            <div className="fixed inset-x-0 bottom-0 z-10 flex flex-wrap justify-center gap-2 border-t border-ink/10 bg-white/95 p-3 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:pt-4">
              <button className="btn-ghost" onClick={listen}><Volume2 size={20} aria-hidden /> सुनें</button>
              <button className="btn-ghost" onClick={copy}>{copied ? <Check size={20} aria-hidden /> : <Copy size={20} aria-hidden />} {copied ? "कॉपी हुआ" : "कॉपी"}</button>
              <a className="btn-ghost" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(toText(data))}`}><Share2 size={20} aria-hidden /> WhatsApp</a>
              <button className="btn-primary" onClick={reset}><RotateCcw size={20} aria-hidden /> नया कागज़</button>
            </div>
          </motion.div>
        )}
      </main>
    </MotionConfig>
  );
}
