"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { questions, type Answers, type Question } from "@/lib/questions";

type Stage = "welcome" | "survey" | "done";

const card =
  "w-full max-w-xl rounded-3xl border border-line bg-surface p-6 shadow-xl shadow-black/5 backdrop-blur-xl sm:p-10";

export default function Survey() {
  const [stage, setStage] = useState<Stage>("welcome");
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const q = questions[index];
  const isLast = index === questions.length - 1;

  const set = (id: string, v: Answers[string]) => setAnswers((a) => ({ ...a, [id]: v }));

  const go = (d: number) => {
    setDir(d);
    setIndex((i) => Math.min(Math.max(i + d, 0), questions.length - 1));
  };

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: clean(answers), website }),
      });
      if (!res.ok) throw new Error();
      setStage("done");
    } catch {
      setError("Something went wrong saving your answers. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const next = () => (isLast ? submit() : go(1));
  const answered = hasAnswer(q, answers[q.id]);

  return (
    <div className={card}>
      <AnimatePresence mode="wait" initial={false}>
        {stage === "welcome" && (
          <motion.div key="welcome" {...fade}>
            <p className="text-sm font-medium tracking-wide text-accent uppercase">Pune Edition</p>
            <h1 className="mt-3 text-3xl leading-tight font-semibold sm:text-4xl">
              The Real Cost of Our Closets
            </h1>
            <p className="mt-4 text-muted">
              How do we shop, wear and let go of clothes? Ten quick questions, about two minutes. Anonymous,
              and every question is optional.
            </p>
            <button onClick={() => setStage("survey")} className={primary + " mt-8 w-full sm:w-auto"}>
              Start survey
            </button>
          </motion.div>
        )}

        {stage === "survey" && (
          <motion.div key="survey" {...fade}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent-soft"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={questions.length}
                aria-valuenow={index + 1}
              >
                <motion.div
                  className="h-full rounded-full bg-accent"
                  animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
              <span className="text-sm text-muted tabular-nums">
                {index + 1} / {questions.length}
              </span>
            </div>

            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={q.id}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22 }}
              >
                <h2 className="text-xl leading-snug font-semibold sm:text-2xl">{q.title}</h2>
                {q.type === "multi" && q.hint && <p className="mt-1 text-sm text-muted">{q.hint}</p>}
                <div className="mt-6">
                  <Input q={q} value={answers[q.id]} onChange={(v) => set(q.id, v)} onPick={() => !isLast && setTimeout(() => go(1), 220)} />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* honeypot — hidden from people, tempting for bots */}
            <input
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              name="website"
            />

            {error && <p className="mt-4 text-sm text-red-500" role="alert">{error}</p>}

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => go(-1)}
                disabled={index === 0}
                className="rounded-full px-4 py-2 text-sm text-muted transition hover:text-fg disabled:invisible"
              >
                ← Back
              </button>
              <button onClick={next} disabled={submitting} className={answered ? primary : ghost}>
                {submitting ? "Submitting…" : isLast ? (answered ? "Submit" : "Skip & submit") : answered ? "Next →" : "Skip →"}
              </button>
            </div>
          </motion.div>
        )}

        {stage === "done" && (
          <motion.div key="done" {...fade} className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-3xl text-accent">
              ✓
            </div>
            <h2 className="mt-6 text-2xl font-semibold sm:text-3xl">Thank you!</h2>
            <p className="mt-3 text-muted">Your response has been recorded.</p>
            <div className="mt-8 rounded-2xl bg-accent-soft p-5 text-left">
              <p className="text-sm font-medium text-accent">Did you know?</p>
              <p className="mt-1">
                One cotton t-shirt takes about <strong>2,700 liters</strong> of water to make, roughly what one
                person drinks in 2.5 years. Wearing what you own is the most sustainable choice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Input({ q, value, onChange, onPick }: { q: Question; value: Answers[string]; onChange: (v: Answers[string]) => void; onPick: () => void }) {
  if (q.type === "single") {
    return (
      <div role="radiogroup" className="grid gap-3">
        {q.options.map((o) => (
          <Choice key={o.value} selected={value === o.value} label={o.label} shape="radio"
            onClick={() => { onChange(o.value); onPick(); }} />
        ))}
      </div>
    );
  }

  if (q.type === "multi") {
    const picked = (Array.isArray(value) ? value : []) as string[];
    const toggle = (v: string) => {
      if (picked.includes(v)) return onChange(picked.filter((p) => p !== v));
      if (v === q.exclusive) return onChange([v]);
      onChange([...picked.filter((p) => p !== q.exclusive), v]);
    };
    return (
      <div role="group" className="grid gap-3">
        {q.options.map((o) => (
          <Choice key={o.value} selected={picked.includes(o.value)} label={o.label} shape="check" onClick={() => toggle(o.value)} />
        ))}
      </div>
    );
  }

  if (q.type === "scale") {
    const nums = Array.from({ length: q.max - q.min + 1 }, (_, i) => q.min + i);
    return (
      <div>
        <div role="radiogroup" className="grid grid-cols-5 gap-2 sm:gap-3">
          {nums.map((n) => (
            <button
              key={n}
              role="radio"
              aria-checked={value === n}
              onClick={() => { onChange(n); onPick(); }}
              className={`aspect-square rounded-2xl border text-lg font-semibold transition active:scale-95 ${
                value === n ? "border-accent bg-accent text-accent-fg" : "border-line bg-solid/60 hover:border-accent"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-xs text-muted sm:text-sm">
          <span>{q.minLabel}</span>
          <span>{q.maxLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <textarea
        rows={4}
        maxLength={q.maxLength}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={q.placeholder}
        className="w-full resize-none rounded-2xl border border-line bg-solid/60 p-4 outline-none transition placeholder:text-muted focus:border-accent"
      />
      <p className="mt-1 text-right text-xs text-muted tabular-nums">
        {(typeof value === "string" ? value : "").length} / {q.maxLength}
      </p>
    </div>
  );
}

function Choice({ selected, label, shape, onClick }: { selected: boolean; label: string; shape: "radio" | "check"; onClick: () => void }) {
  return (
    <button
      role={shape === "radio" ? "radio" : "checkbox"}
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition active:scale-[0.99] ${
        selected ? "border-accent bg-accent-soft" : "border-line bg-solid/60 hover:border-accent/60"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 text-[11px] leading-none ${
          shape === "radio" ? "rounded-full" : "rounded-md"
        } ${selected ? "border-accent bg-accent text-accent-fg" : "border-muted/50"}`}
      >
        {selected && (shape === "check" ? "✓" : "")}
      </span>
      <span>{label}</span>
    </button>
  );
}

function hasAnswer(q: Question, v: Answers[string]) {
  if (v === undefined) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim() !== "";
  return true;
}

function clean(a: Answers) {
  const out: Answers = {};
  for (const q of questions) if (hasAnswer(q, a[q.id])) out[q.id] = a[q.id];
  return out;
}

const primary =
  "rounded-full bg-accent px-6 py-3 font-medium text-accent-fg shadow-lg shadow-accent/20 transition hover:opacity-90 active:scale-95 disabled:opacity-60";
const ghost =
  "rounded-full border border-line px-6 py-3 font-medium text-muted transition hover:text-fg active:scale-95 disabled:opacity-60";

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25 },
};

const slide = {
  enter: (d: number) => ({ opacity: 0, x: 30 * d }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: -30 * d }),
};
