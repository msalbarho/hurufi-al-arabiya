import { createFileRoute, Link } from "@tanstack/react-router";
import { Volume2, VolumeX, Lock } from "lucide-react";
import { PageShell } from "@/components/kids/PageShell";
import { Character } from "@/components/kids/Character";
import { SectionCard } from "@/components/kids/SectionCard";
import { SectionTitle, StarPill } from "@/components/kids/ui";
import { LETTERS } from "@/content/letters";
import { useProgress, useSectionProgress } from "@/lib/progress/store";
import { AudioManager } from "@/lib/audio/AudioManager";
import { UNLOCK_THRESHOLD } from "@/lib/rules/mastery";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "حُرُوفِي العَرَبِيَّة — تعلّم الحروف والكلمات باللعب" },
      { name: "description", content: "الشاشة الرئيسية: خمس جزر تعليمية للحروف، الكلمات، الجمل، القصص والحركات للأطفال من 4 سنوات." },
      { property: "og:title", content: "حُرُوفِي العَرَبِيَّة — تعلّم الحروف والكلمات باللعب" },
      { property: "og:description", content: "خمس جزر تعليمية للحروف، الكلمات، الجمل، القصص والحركات للأطفال من 4 سنوات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const letterIds = LETTERS.map((l) => l.id);

function Home() {
  const name = useProgress((s) => s.profile.name);
  const stars = useProgress((s) => s.stars);
  const sound = useProgress((s) => s.settings.sound);
  const updateSettings = useProgress((s) => s.updateSettings);
  const letters = useSectionProgress("letter", letterIds);

  const lettersUnlockedNext = letters.ratio >= UNLOCK_THRESHOLD;
  const stage = letters.ratio >= 1 ? "المرحلة الثانية" : "المرحلة الأولى";

  const greet = () => {
    void AudioManager.speak(`يا ${name}! جاهز لرحلتنا اليوم؟`);
  };

  return (
    <PageShell>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <span className="grid size-12 -rotate-6 place-items-center rounded-2xl bg-coral font-display text-2xl font-extrabold text-paper shadow-chunky-sm">
            ح
          </span>
          <div>
            <p className="font-display text-lg font-extrabold leading-none">حُرُوفِي العَرَبِيَّة</p>
            <p className="text-xs text-ink/50">تعلّم الحروف وأنت تلعب</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-sun px-4 py-2 text-sm font-bold shadow-chunky-xs sm:inline-block">{stage}</span>
          <StarPill stars={stars} />
          <button
            type="button"
            aria-label={sound ? "كتم الصوت" : "تشغيل الصوت"}
            onClick={() => updateSettings({ sound: !sound })}
            className="press grid size-12 place-items-center rounded-full border-2 border-ink/10 bg-paper/70 text-xl"
          >
            {sound ? <Volume2 className="size-6" /> : <VolumeX className="size-6" />}
          </button>
          <Link
            to="/parents"
            aria-label="بوابة الوالدين"
            className="press grid size-12 place-items-center rounded-full border-2 border-ink/10 bg-paper/70 text-ink/60"
          >
            <Lock className="size-5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 pt-4 pb-16 lg:grid-cols-12">
        {/* Hero */}
        <section className="relative lg:col-span-5">
          <div className="absolute inset-0 -skew-x-6 rounded-[2rem] bg-gradient-to-br from-coral to-sun" />
          <div className="relative flex min-h-full flex-col justify-between p-7 text-paper">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-ink/15 px-3 py-1 text-xs font-bold">مرحباً بك</span>
              <span className="rounded-full bg-paper/25 px-3 py-1 text-xs font-bold">4–8 سنوات</span>
            </div>
            <div className="mt-6">
              <h1 className="font-display text-5xl font-extrabold leading-[1.05]">
                يا <span className="text-ink">{name}</span>! جاهز لرحلتنا اليوم؟
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-paper/90">
                اختر جزيرة من الجزر الخمس وابدأ مغامرتك مع الحروف والكلمات الجميلة.
              </p>
              <Link
                to="/learn"
                onClick={() => AudioManager.tap()}
                className="press mt-8 inline-flex min-h-[72px] items-center justify-center rounded-2xl bg-paper px-8 font-display text-2xl font-extrabold text-ink shadow-[0_6px_0_0_oklch(0.22_0.04_280/0.35)]"
              >
                ابدأ التعلّم
              </Link>
            </div>
            <button type="button" onClick={greet} aria-label="اسمع الترحيب" className="mt-8 self-start">
              <Character />
            </button>
          </div>
        </section>

        {/* Islands */}
        <section className="lg:col-span-7">
          <SectionTitle>جزر التعلّم</SectionTitle>
          <div className="grid grid-cols-2 gap-5">
            <SectionCard to="/letters" tone="sun" glyph="أ" title="الحروف" subtitle={`تعرف على ${LETTERS.length} حرفاً`} progress={letters.ratio} />
            <SectionCard to="/words" tone="sea" glyph="ك" title="كلماتي" subtitle="ابنِ كلماتك الأولى" />
            <SectionCard to="/sentences" tone="berry" glyph="ج" title="الجُمل" subtitle="رتّب الكلمات جُملاً" />
            <SectionCard to="/stories" tone="lilac" glyph="ق" title="القصص" subtitle="اقرأ قصة قصيرة" />
            <SectionCard to="/diacritics" tone="coral" glyph="ش" title="الحركات" subtitle="ضع الفتحة والكسرة والضمّة" wide locked={!lettersUnlockedNext} />
          </div>
        </section>

        {/* Daily letter teaser */}
        <DailyLetter />
      </main>
    </PageShell>
  );
}

function DailyLetter() {
  const items = useProgress((s) => s.items);
  const next = LETTERS.find((l) => (items[`letter:${l.id}`]?.mastery ?? 0) < 2) ?? LETTERS[0]!;

  return (
    <section className="lg:col-span-12">
      <div className="relative overflow-hidden rounded-[2rem] bg-ink p-6 text-paper md:p-8">
        <div className="blob -top-10 -right-10 size-40 bg-coral/30" />
        <div className="blob -bottom-16 left-10 size-48 bg-sea/20" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex-1">
            <span className="mb-3 inline-block rounded-full bg-coral/20 px-3 py-1 text-xs font-bold text-coral">حرف اليوم</span>
            <h2 className="font-display text-3xl font-extrabold md:text-4xl">حرف {next.nameAr}</h2>
            <p className="mt-2 text-paper/70">استمع إلى نطق الحرف ثم تعلّم كتابته بأشكاله الثلاثة.</p>
          </div>
          <div className="flex shrink-0 items-center gap-5">
            <Link
              to="/letters/$id"
              params={{ id: next.id }}
              className="press grid size-32 -rotate-3 animate-pop place-items-center rounded-3xl bg-paper text-ink shadow-[0_14px_0_0_oklch(0_0_0/0.25)] md:size-40"
            >
              <span className="arabic-letter text-7xl md:text-8xl">{next.char}</span>
            </Link>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => void AudioManager.speak(next.nameAr)}
                className="press flex items-center gap-2 rounded-2xl bg-sun px-5 py-3 font-display font-extrabold text-ink shadow-[0_6px_0_0_oklch(0.22_0.04_280/0.35)]"
              >
                <Volume2 className="size-5" /> استمع
              </button>
              <Link
                to="/letters/$id"
                params={{ id: next.id }}
                className="press flex items-center gap-2 rounded-2xl bg-coral px-5 py-3 font-display font-extrabold text-paper shadow-[0_6px_0_0_oklch(0.22_0.04_280/0.35)]"
              >
                ✍️ اكتب
              </Link>
            </div>
          </div>
        </div>
        <div className="relative mt-7 grid grid-cols-3 gap-3 md:gap-4">
          {[
            ["أول الكلمة", next.forms.initial, false],
            ["وسط الكلمة", next.forms.medial, false],
            ["آخر الكلمة", next.forms.final, true],
          ].map(([label, form, hi]) => (
            <div
              key={label as string}
              className={hi ? "rounded-2xl border border-sun/30 bg-sun/20 p-4 text-center" : "rounded-2xl border border-paper/15 bg-paper/10 p-4 text-center"}
            >
              <p className={hi ? "mb-1 text-xs text-sun" : "mb-1 text-xs text-paper/60"}>{label as string}</p>
              <span className="arabic-letter text-5xl">{form as string}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
