import { Lock } from "lucide-react";

export function CurriculumLoadError({ detail }: { detail: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-[2rem] border-2 border-ink/10 bg-card p-8 text-center shadow-chunky">
      <p className="font-display text-3xl font-extrabold">تَعَذَّرَ بَدْءُ النَّشَاط</p>
      <p className="mt-3 text-ink/60">لِنَرْجِعْ وَنُحَاوِلَ مَرَّةً أُخْرَى.</p>
      {import.meta.env.DEV ? (
        <p className="mt-4 font-mono text-sm text-coral">{detail}</p>
      ) : null}
    </div>
  );
}

export function UnitLockedCard({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-[2rem] border-2 border-ink/10 bg-card p-8 text-center shadow-chunky">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-sun text-ink shadow-chunky-xs">
        <Lock className="size-8" />
      </span>
      <h2 className="mt-5 font-display text-3xl font-extrabold">{title}</h2>
      <p className="mt-3 text-lg text-ink/60">هَذِهِ الْوَحْدَةُ قَرِيباً</p>
    </div>
  );
}
