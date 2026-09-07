import { cn } from "@/lib/utils";

const SUCCESS = "أَحْسَنْتَ!";
const RETRY = "حَاوِلْ مَرَّةً أُخْرَى";

export function FeedbackBurst({ kind }: { kind: "ok" | "retry" }) {
  const label = kind === "ok" ? SUCCESS : RETRY;
  return (
    <div className="pointer-events-none fixed inset-0 z-20 grid place-items-center">
      <div className="animate-pop rounded-[2rem] bg-card/95 px-10 py-8 text-center shadow-chunky">
        {kind === "ok" ? (
          <div className="mb-2 flex justify-center gap-2 text-5xl">
            {["⭐", "🌟", "⭐"].map((star, i) => (
              <span key={i} className="animate-star" style={{ animationDelay: `${i * 120}ms` }}>
                {star}
              </span>
            ))}
          </div>
        ) : (
          <p className="mb-2 text-4xl" aria-hidden>
            💪
          </p>
        )}
        <p className={cn("font-display text-3xl font-extrabold", kind === "ok" ? "text-coral" : "text-sea")}>
          {label}
        </p>
      </div>
    </div>
  );
}
