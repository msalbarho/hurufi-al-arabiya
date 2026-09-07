import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { AudioManager } from "@/lib/audio/AudioManager";

type Tone = "coral" | "sun" | "sea" | "berry" | "lilac";
const badge: Record<Tone, string> = {
  coral: "bg-coral text-paper",
  sun: "bg-sun text-ink",
  sea: "bg-sea text-paper",
  berry: "bg-berry text-paper",
  lilac: "bg-lilac text-paper",
};
const text: Record<Tone, string> = {
  coral: "text-coral",
  sun: "text-coral",
  sea: "text-sea",
  berry: "text-berry",
  lilac: "text-lilac",
};

export function SectionCard({
  to,
  tone,
  glyph,
  title,
  subtitle,
  locked,
  progress,
  wide,
}: {
  to: string;
  tone: Tone;
  glyph: string;
  title: string;
  subtitle: string;
  locked?: boolean;
  progress?: number; // 0..1
  wide?: boolean;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "absolute -top-4 right-6 grid size-14 place-items-center rounded-full font-display text-2xl font-extrabold shadow-chunky-xs",
          badge[tone],
        )}
      >
        {locked ? <Lock className="size-6" /> : glyph}
      </span>
      <div className={cn(wide && "flex items-center justify-between gap-4")}>
        <div>
          <h3 className="mt-2 font-display text-2xl font-extrabold">{title}</h3>
          <p className={cn("mt-1 text-sm", wide ? "text-paper/60" : "text-ink/55")}>{subtitle}</p>
        </div>
        {wide ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-coral px-4 py-2 text-sm font-bold text-paper">
            ابدأ <span className="transition group-hover:-translate-x-1">←</span>
          </span>
        ) : (
          <span className={cn("mt-3 inline-flex items-center gap-1 text-sm font-bold", text[tone])}>
            {locked ? "مقفل" : "ابدأ"} {!locked && <span className="transition group-hover:-translate-x-1">←</span>}
          </span>
        )}
      </div>
      {typeof progress === "number" && progress > 0 && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
          <div className={cn("h-full rounded-full", badge[tone].split(" ")[0])} style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
    </>
  );

  const base = cn(
    "group relative block rounded-3xl p-5 pt-6 press",
    wide
      ? "col-span-2 bg-gradient-to-l from-ink to-lilac/70 text-paper shadow-chunky"
      : "bg-card border-2 border-ink/10 shadow-chunky",
    locked && "opacity-70 grayscale-[30%]",
  );

  if (locked) {
    return (
      <div
        className={base}
        role="button"
        aria-disabled
        onClick={() => {
          AudioManager.error();
          void AudioManager.speak("أكمل القسم السابق أولاً");
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link to={to} className={base} onClick={() => AudioManager.tap()}>
      {inner}
    </Link>
  );
}
