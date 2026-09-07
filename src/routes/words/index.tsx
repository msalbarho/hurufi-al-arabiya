import { createFileRoute } from "@tanstack/react-router";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { PageShell } from "@/components/kids/PageShell";
import { BackButton, SectionTitle, StarPill } from "@/components/kids/ui";
import { ALL_WORDS, CATEGORIES, type Category, type CategoryId, type Word } from "@/content/words";
import { AudioManager } from "@/lib/audio/AudioManager";
import { useProgress } from "@/lib/progress/store";
import { cn } from "@/lib/utils";

type FilterId = CategoryId | "all";

const TONE_BADGE: Record<Category["tone"], string> = {
  coral: "bg-coral text-paper",
  sun: "bg-sun text-ink",
  sea: "bg-sea text-paper",
  berry: "bg-berry text-paper",
  lilac: "bg-lilac text-paper",
};

const TONE_RING: Record<Category["tone"], string> = {
  coral: "ring-coral",
  sun: "ring-sun",
  sea: "ring-sea",
  berry: "ring-berry",
  lilac: "ring-lilac",
};

const TONE_SOFT: Record<Category["tone"], string> = {
  coral: "bg-coral/10",
  sun: "bg-sun/15",
  sea: "bg-sea/10",
  berry: "bg-berry/10",
  lilac: "bg-lilac/10",
};

export const Route = createFileRoute("/words/")({
  head: () => ({
    meta: [
      { title: "كلماتي — حُرُوفِي العَرَبِيَّة" },
      { name: "description", content: "جزيرة الكلمات: ابنِ كلماتك العربية الأولى بالحروف التي تعلّمتها." },
      { property: "og:title", content: "كلماتي — حُرُوفِي العَرَبِيَّة" },
      { property: "og:description", content: "ابنِ كلماتك العربية الأولى بالحروف التي تعلّمتها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WordsIndex,
});

function WordsIndex() {
  const stars = useProgress((s) => s.stars);
  const [selected, setSelected] = useState<FilterId | null>(null);
  const wordsRef = useRef<HTMLElement>(null);
  const wordCount = ALL_WORDS.length;

  const selectedCategory = selected && selected !== "all" ? CATEGORIES.find((c) => c.id === selected) : undefined;

  const words = useMemo(() => {
    if (!selected) return [];
    if (selected === "all") return ALL_WORDS;
    return selectedCategory?.words ?? [];
  }, [selected, selectedCategory]);

  const headingTone: Category["tone"] = selected === "all" ? "sea" : (selectedCategory?.tone ?? "sea");
  const headingEmoji = selected === "all" ? "📚" : (selectedCategory?.emoji ?? "");
  const headingName = selected === "all" ? "كل الكلمات" : (selectedCategory?.nameAr ?? "");

  useEffect(() => {
    if (!selected) return;
    wordsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selected]);

  const choose = (id: FilterId) => {
    AudioManager.tap();
    setSelected(id);
  };

  return (
    <PageShell>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-none">كلماتي</h1>
            <p className="mt-1 text-sm text-ink/50">اكتشف كلمات جديدة وتعلّمها</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-sea px-4 py-2 font-display text-lg font-extrabold text-paper shadow-chunky-xs">
            {wordCount.toLocaleString("ar-EG")} كلمة
          </span>
          <StarPill stars={stars} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-8 pb-16">
        <SectionTitle dotTone="sea">التصنيفات</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <CategoryCard
            emoji="📚"
            name="الكل"
            count={wordCount}
            tone="sea"
            selected={selected === "all"}
            onClick={() => choose("all")}
          />
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              emoji={category.emoji}
              name={category.nameAr}
              count={category.words.length}
              tone={category.tone}
              selected={selected === category.id}
              onClick={() => choose(category.id)}
            />
          ))}
        </div>

        {selected ? (
          <section ref={wordsRef} className="mt-12 scroll-mt-6">
            <SectionTitle dotTone={headingTone}>
              <span className="ml-1">{headingEmoji}</span>
              {headingName}
              <span className="mr-2 text-base font-bold text-ink/45">
                {words.length.toLocaleString("ar-EG")} كلمة
              </span>
            </SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {words.map((word) => (
                <WordCard key={word.id} word={word} />
              ))}
            </div>
          </section>
        ) : (
          <p className="mt-12 text-center font-display text-lg font-bold text-ink/40">اختر تصنيفاً لعرض كلماته</p>
        )}
      </main>
    </PageShell>
  );
}

function CategoryCard({
  emoji,
  name,
  count,
  tone,
  selected,
  onClick,
}: {
  emoji: string;
  name: string;
  count: number;
  tone: Category["tone"];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "press flex min-h-[132px] flex-col items-center justify-center gap-1.5 rounded-3xl border-2 p-4 shadow-chunky",
        selected
          ? cn("border-transparent ring-4 ring-offset-2 ring-offset-paper", TONE_RING[tone], TONE_SOFT[tone])
          : "border-ink/10 bg-card",
      )}
    >
      <span className={cn("grid size-14 place-items-center rounded-full text-2xl shadow-chunky-xs", TONE_BADGE[tone])}>
        {emoji}
      </span>
      <span className="font-display text-xl font-extrabold leading-tight">{name}</span>
      <span className="text-sm text-ink/50">{count.toLocaleString("ar-EG")} كلمة</span>
    </button>
  );
}

const WordCard = memo(function WordCard({ word }: { word: Word }) {
  return (
    <button
      type="button"
      onClick={() => {
        void AudioManager.speak(word.diacritized);
      }}
      className="press flex min-h-[124px] flex-col items-center justify-center gap-1.5 rounded-3xl border-2 border-ink/10 bg-card px-3 py-4 shadow-chunky-xs [content-visibility:auto] [contain-intrinsic-size:auto_124px]"
    >
      <span className="text-4xl leading-none" aria-hidden>
        {word.emoji}
      </span>
      <span className="arabic-letter text-center text-2xl text-ink">{word.diacritized}</span>
    </button>
  );
});
