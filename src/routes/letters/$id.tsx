import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Volume2, Pencil, Ear, ChevronLeft, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/kids/PageShell";
import { BackButton, BigButton, StarRow } from "@/components/kids/ui";
import { TracingCanvas } from "@/components/kids/TracingCanvas";
import { getLetter, getLetterByOrder, HARAKAT, LETTERS, withHaraka, type Letter } from "@/content/letters";
import { useProgress } from "@/lib/progress/store";
import { AudioManager } from "@/lib/audio/AudioManager";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/letters/$id")({
  loader: ({ params }) => {
    const letter = getLetter(params.id);
    if (!letter) throw notFound();
    return { letter };
  },
  head: ({ loaderData }) => {
    const l = loaderData?.letter;
    const title = l ? `حرف ${l.nameAr} (${l.char}) — حُرُوفِي العَرَبِيَّة` : "حرف — حُرُوفِي العَرَبِيَّة";
    const desc = l ? `تعلّم نطق وكتابة حرف ${l.nameAr} بأشكاله في أول ووسط وآخر الكلمة مع كلمة ${l.example.text}.` : "";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LetterScreen,
});

type Mode = "learn" | "write" | "listen";

function LetterScreen() {
  const { letter } = Route.useLoaderData();
  const [mode, setMode] = useState<Mode>("learn");
  const markSeen = useProgress((s) => s.markSeen);
  const mastery = useProgress((s) => s.items[`letter:${letter.id}`]?.mastery ?? 0);

  useEffect(() => {
    setMode("learn");
    markSeen("letter", letter.id);
    const t = setTimeout(() => void AudioManager.speak(`حرف ${letter.nameAr}`), 300);
    return () => clearTimeout(t);
  }, [letter.id, letter.nameAr, markSeen]);

  const prev = getLetterByOrder(letter.order - 1);
  const next = getLetterByOrder(letter.order + 1);

  return (
    <PageShell>
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-4">
          <BackButton to="/letters" />
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-none">حرف {letter.nameAr}</h1>
            <p className="mt-1 text-sm text-ink/50">
              الحرف {letter.order.toLocaleString("ar-EG")} من {LETTERS.length.toLocaleString("ar-EG")}
            </p>
          </div>
        </div>
        <StarRow value={mastery} />
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-6 pb-28">
        {mode === "learn" && <LearnMode letter={letter} />}
        {mode === "write" && <WriteMode letter={letter} onDone={() => setMode("learn")} />}
        {mode === "listen" && <ListenMode letter={letter} onDone={() => setMode("learn")} />}

        {/* Mode switcher */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <ModeTab active={mode === "learn"} tone="sun" onClick={() => setMode("learn")} icon={<Volume2 className="size-7" />} label="تعلّم" />
          <ModeTab active={mode === "write"} tone="coral" onClick={() => setMode("write")} icon={<Pencil className="size-7" />} label="اكتب" />
          <ModeTab active={mode === "listen"} tone="sea" onClick={() => setMode("listen")} icon={<Ear className="size-7" />} label="اسمع واختر" />
        </div>
      </main>

      {/* prev / next */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t-2 border-ink/5 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <NavLink letter={prev} dir="prev" />
          <span className="font-display text-lg font-extrabold text-ink/40">{letter.char}</span>
          <NavLink letter={next} dir="next" />
        </div>
      </nav>
    </PageShell>
  );
}

function NavLink({ letter, dir }: { letter?: Letter | undefined; dir: "prev" | "next" }) {
  if (!letter) return <span className="w-28" />;
  return (
    <Link
      to="/letters/$id"
      params={{ id: letter.id }}
      onClick={() => AudioManager.tap()}
      className="press flex min-h-14 w-28 items-center justify-center gap-1 rounded-2xl border-2 border-ink/10 bg-card font-display text-xl font-extrabold shadow-chunky-xs"
    >
      {dir === "prev" ? <ChevronRight className="size-5" /> : null}
      <span className="arabic-letter text-2xl">{letter.char}</span>
      {dir === "next" ? <ChevronLeft className="size-5" /> : null}
    </Link>
  );
}

function ModeTab({ active, tone, onClick, icon, label }: { active: boolean; tone: "sun" | "coral" | "sea"; onClick: () => void; icon: React.ReactNode; label: string }) {
  const bg = { sun: "bg-sun text-ink", coral: "bg-coral text-paper", sea: "bg-sea text-paper" }[tone];
  return (
    <button
      type="button"
      onClick={() => {
        AudioManager.tap();
        onClick();
      }}
      className={cn(
        "press flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl font-display text-lg font-extrabold shadow-chunky-sm",
        active ? bg : "border-2 border-ink/10 bg-card text-ink/60",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

/* ---------------- Learn ---------------- */
function LearnMode({ letter }: { letter: Letter }) {
  const [activeForm, setActiveForm] = useState<keyof Letter["forms"]>("isolated");

  return (
    <div className="animate-pop">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-paper md:p-8">
        <div className="blob -top-10 -right-10 size-40 bg-coral/30" />
        <div className="blob -bottom-16 left-10 size-48 bg-sea/20" />
        <div className="relative flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <button
            type="button"
            aria-label={`انطق حرف ${letter.nameAr}`}
            onClick={() => {
              AudioManager.tap();
              void AudioManager.speak(letter.nameAr);
            }}
            className="press grid size-44 -rotate-3 place-items-center rounded-3xl bg-paper text-ink shadow-[0_14px_0_0_oklch(0_0_0/0.25)] md:size-52"
          >
            <span className="arabic-letter text-8xl md:text-9xl">{letter.forms[activeForm]}</span>
          </button>

          <div className="flex flex-1 flex-col items-center gap-3 md:items-start">
            <span className="rounded-full bg-coral/20 px-3 py-1 text-xs font-bold text-coral">اضغط الحرف لتسمعه</span>
            <div className="grid w-full grid-cols-3 gap-3">
              {(
                [
                  ["initial", "أول الكلمة"],
                  ["medial", "وسط الكلمة"],
                  ["final", "آخر الكلمة"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    AudioManager.tap();
                    setActiveForm(k);
                    void AudioManager.speak(letter.nameAr);
                  }}
                  className={cn(
                    "press rounded-2xl border p-3 text-center",
                    activeForm === k ? "border-sun/40 bg-sun/20" : "border-paper/15 bg-paper/10",
                  )}
                >
                  <p className={cn("mb-1 text-xs", activeForm === k ? "text-sun" : "text-paper/60")}>{label}</p>
                  <span className="arabic-letter text-4xl md:text-5xl">{letter.forms[k]}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setActiveForm("isolated")}
              className="text-xs text-paper/50 underline-offset-4 hover:underline"
            >
              الشكل المنفصل
            </button>
          </div>
        </div>
      </div>

      {/* Harakat + example word */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border-2 border-ink/10 bg-card p-5 shadow-chunky">
          <p className="mb-3 font-display text-lg font-extrabold">بالحركات</p>
          <div className="grid grid-cols-4 gap-2">
            {HARAKAT.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  AudioManager.tap();
                  void AudioManager.speak(withHaraka(letter.char, h.id));
                }}
                className="press flex aspect-square flex-col items-center justify-center rounded-2xl bg-sun/30"
              >
                <span className="arabic-letter text-4xl">{withHaraka(letter.char, h.id)}</span>
                <span className="text-[10px] text-ink/60">{h.nameAr}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            AudioManager.tap();
            void AudioManager.speak(letter.example.diacritized);
          }}
          className="press flex items-center justify-between gap-4 rounded-3xl border-2 border-ink/10 bg-card p-5 text-right shadow-chunky"
        >
          <div>
            <p className="mb-1 text-xs font-bold text-sea">كلمة تبدأ بـ {letter.char}</p>
            <span className="arabic-letter text-5xl">
              <span className="text-coral">{letter.example.diacritized.slice(0, letter.example.diacritized.search(/[^\u0621-\u064A][\u064B-\u0652]?/) === -1 ? 1 : 1)}</span>
              {letter.example.diacritized.slice(1)}
            </span>
          </div>
          <span className="grid size-24 place-items-center rounded-full bg-sea/15 text-6xl">{letter.example.emoji}</span>
        </button>
      </div>
    </div>
  );
}

/* ---------------- Write ---------------- */
function WriteMode({ letter, onDone }: { letter: Letter; onDone: () => void }) {
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const [celebrate, setCelebrate] = useState(false);

  const handleComplete = () => {
    AudioManager.success();
    void AudioManager.speak("أحسنت!");
    recordAttempt("letter", letter.id, true);
    setCelebrate(true);
    setTimeout(() => {
      setCelebrate(false);
      onDone();
    }, 1600);
  };

  return (
    <div className="animate-pop text-center">
      <p className="mb-4 font-display text-2xl font-extrabold">تتبّع الحرف بإصبعك</p>
      <TracingCanvas glyph={letter.char} onComplete={handleComplete} />
      {celebrate && <Celebration />}
    </div>
  );
}

/* ---------------- Listen & choose ---------------- */
function ListenMode({ letter, onDone }: { letter: Letter; onDone: () => void }) {
  const recordAttempt = useProgress((s) => s.recordAttempt);
  const difficulty = useProgress((s) => s.profile.difficulty);
  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const optionCount = difficulty === "easy" ? 2 : difficulty === "hard" ? 4 : 3;

  const options = useMemo(() => {
    const pool = LETTERS.filter((l) => l.id !== letter.id);
    const similar = (letter.similar ?? []).map((id) => LETTERS.find((l) => l.id === id)!).filter(Boolean);
    const distractors = [...similar, ...pool.sort(() => Math.random() - 0.5)]
      .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
      .slice(0, optionCount - 1);
    return [letter, ...distractors].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter.id, round, optionCount]);

  useEffect(() => {
    const t = setTimeout(() => void AudioManager.speak(letter.nameAr), 400);
    return () => clearTimeout(t);
  }, [letter.nameAr, round]);

  const pick = (l: Letter) => {
    if (l.id === letter.id) {
      AudioManager.success();
      const { starsGained } = recordAttempt("letter", letter.id, true);
      if (starsGained > 1) AudioManager.star();
      setCelebrate(true);
      setTimeout(() => {
        setCelebrate(false);
        if (round >= 2) onDone();
        else setRound((r) => r + 1);
      }, 1400);
    } else {
      AudioManager.error();
      recordAttempt("letter", letter.id, false);
      setWrong(l.id);
      void AudioManager.speak(`لا، هذا ${l.nameAr}. أين ${letter.nameAr}؟`);
      setTimeout(() => setWrong(null), 600);
    }
  };

  return (
    <div className="animate-pop text-center">
      <p className="mb-2 font-display text-2xl font-extrabold">اسمع… ثم اختر الحرف الصحيح</p>
      <p className="mb-5 text-sm text-ink/50">الجولة {(round + 1).toLocaleString("ar-EG")} من ٣</p>
      <BigButton tone="sun" onClick={() => void AudioManager.speak(letter.nameAr)} className="mb-8 min-w-48">
        <Volume2 className="size-8" /> اسمع مرة أخرى
      </BigButton>
      <div className={cn("mx-auto grid max-w-lg gap-4", optionCount === 4 ? "grid-cols-2" : "grid-cols-" + optionCount)}>
        {options.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => pick(l)}
            className={cn(
              "press grid aspect-square place-items-center rounded-3xl border-2 border-ink/10 bg-card shadow-chunky",
              wrong === l.id && "animate-wiggle border-coral bg-coral/10",
            )}
          >
            <span className="arabic-letter text-7xl">{l.char}</span>
          </button>
        ))}
      </div>
      {celebrate && <Celebration />}
    </div>
  );
}

function Celebration() {
  return (
    <div className="pointer-events-none fixed inset-0 z-20 grid place-items-center">
      <div className="animate-pop rounded-[2rem] bg-card/95 px-10 py-8 text-center shadow-chunky">
        <div className="mb-2 flex justify-center gap-2 text-5xl">
          {["⭐", "🌟", "⭐"].map((s, i) => (
            <span key={i} className="animate-star" style={{ animationDelay: `${i * 120}ms` }}>
              {s}
            </span>
          ))}
        </div>
        <p className="font-display text-3xl font-extrabold text-coral">أحسنت!</p>
      </div>
    </div>
  );
}
