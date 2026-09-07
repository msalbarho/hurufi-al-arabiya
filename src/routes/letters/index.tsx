import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/kids/PageShell";
import { BackButton, SectionTitle, StarPill, StarRow } from "@/components/kids/ui";
import { LETTERS } from "@/content/letters";
import { useProgress } from "@/lib/progress/store";
import { AudioManager } from "@/lib/audio/AudioManager";

export const Route = createFileRoute("/letters/")({
  head: () => ({
    meta: [
      { title: "الحروف — حُرُوفِي العَرَبِيَّة" },
      { name: "description", content: "تعلّم الحروف العربية الثمانية والعشرين بالنطق والكتابة وأشكالها في أول ووسط وآخر الكلمة." },
      { property: "og:title", content: "الحروف — حُرُوفِي العَرَبِيَّة" },
      { property: "og:description", content: "تعلّم الحروف العربية بالنطق والكتابة وأشكالها المختلفة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LettersIndex,
});

function LettersIndex() {
  const items = useProgress((s) => s.items);
  const stars = useProgress((s) => s.stars);

  return (
    <PageShell>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="font-display text-3xl font-extrabold leading-none">الحروف</h1>
            <p className="mt-1 text-sm text-ink/50">اضغط على أي حرف لتسمعه وتتعلّمه</p>
          </div>
        </div>
        <StarPill stars={stars} />
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-8 pb-16">
        <SectionTitle dotTone="sun">جزيرة الحروف</SectionTitle>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
          {LETTERS.map((l, i) => {
            const mastery = items[`letter:${l.id}`]?.mastery ?? 0;
            return (
              <Link
                key={l.id}
                to="/letters/$id"
                params={{ id: l.id }}
                onClick={() => {
                  AudioManager.tap();
                  void AudioManager.speak(l.nameAr);
                }}
                className="press group relative flex aspect-square flex-col items-center justify-center rounded-3xl border-2 border-ink/10 bg-card shadow-chunky animate-pop"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <span className="arabic-letter text-6xl text-ink transition group-hover:scale-110 sm:text-7xl">{l.char}</span>
                <div className="absolute bottom-2">
                  <StarRow value={mastery} size="sm" />
                </div>
                <span className="absolute -top-2 -right-2 grid size-8 place-items-center rounded-full bg-sun font-display text-sm font-extrabold text-ink shadow-chunky-xs">
                  {l.order.toLocaleString("ar-EG")}
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </PageShell>
  );
}
