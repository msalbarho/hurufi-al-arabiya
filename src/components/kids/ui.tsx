import { Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AudioManager } from "@/lib/audio/AudioManager";

/* Big chunky button — min 72px tall for small fingers */
type Tone = "coral" | "sun" | "sea" | "berry" | "lilac" | "ink" | "paper";
const tones: Record<Tone, string> = {
  coral: "bg-coral text-paper",
  sun: "bg-sun text-ink",
  sea: "bg-sea text-paper",
  berry: "bg-berry text-paper",
  lilac: "bg-lilac text-paper",
  ink: "bg-ink text-paper",
  paper: "bg-card text-ink border-2 border-ink/10",
};

export function BigButton({
  tone = "coral",
  className,
  children,
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        AudioManager.tap();
        onClick?.();
      }}
      className={cn(
        "press inline-flex min-h-[72px] items-center justify-center gap-3 rounded-2xl px-6 font-display text-2xl font-extrabold shadow-chunky-sm disabled:opacity-50",
        tones[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function BackButton({ to = "/" }: { to?: string }) {
  return (
    <Link
      to={to}
      aria-label="رجوع"
      onClick={() => AudioManager.tap()}
      className="press grid size-14 place-items-center rounded-2xl border-2 border-ink/10 bg-card text-ink shadow-chunky-xs"
    >
      <ArrowRight className="size-7" />
    </Link>
  );
}

export function StarRow({ value, size = "md" }: { value: number; size?: "sm" | "md" | "lg" }) {
  const s = { sm: "size-5", md: "size-7", lg: "size-10" }[size];
  return (
    <div className="flex items-center gap-1" aria-label={`${value} من 3 نجوم`}>
      {[1, 2, 3].map((i) => (
        <Star
          key={i}
          className={cn(s, i <= value ? "fill-sun text-sun animate-star" : "fill-ink/10 text-ink/10")}
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );
}

export function StarPill({ stars }: { stars: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-sun px-4 py-2 font-display text-lg font-extrabold text-ink shadow-chunky-xs">
      <Star className="size-5 fill-ink text-ink" />
      {stars.toLocaleString("ar-EG")}
    </span>
  );
}

export function SectionTitle({ children, dotTone = "coral" }: { children: ReactNode; dotTone?: Tone }) {
  return (
    <p className="mb-6 flex items-center gap-2 font-display text-2xl font-extrabold">
      <span className={cn("inline-block size-3 rounded-full", tones[dotTone].split(" ")[0])} />
      {children}
    </p>
  );
}
