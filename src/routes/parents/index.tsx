import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { PageShell } from "@/components/kids/PageShell";
import { useProgress } from "@/lib/progress/store";
import { makeChallenge } from "@/lib/rules/parentGate";
import { LETTERS } from "@/content/letters";

export const Route = createFileRoute("/parents/")({
  head: () => ({
    meta: [
      { title: "بوابة الوالدين — حُرُوفِي العَرَبِيَّة" },
      { name: "description", content: "تقارير تقدّم الطفل، دقائق التعلّم، النجوم والإعدادات داخل تطبيق حُرُوفِي العَرَبِيَّة." },
      { property: "og:title", content: "بوابة الوالدين — حُرُوفِي العَرَبِيَّة" },
      { property: "og:description", content: "تابع تقدّم طفلك: الحروف المتقنة، دقائق التعلّم، النجوم والإعدادات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Parents,
});

function Parents() {
  const [challenge, setChallenge] = useState(() => makeChallenge());
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  if (!open) {
    return (
      <PageShell>
        <div className="mx-auto grid min-h-screen max-w-md place-items-center px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (Number(value) === challenge.answer) {
                setOpen(true);
              } else {
                setError(true);
                setValue("");
                setChallenge(makeChallenge());
              }
            }}
            className="w-full rounded-3xl border-2 border-ink/10 bg-card p-6 shadow-chunky"
          >
            <h1 className="font-display text-2xl font-extrabold">بوابة الوالدين</h1>
            <p className="mt-1 text-sm text-ink/55">للدخول، احسب الناتج:</p>
            <p className="mt-4 font-display text-4xl font-extrabold">{challenge.question} = ؟</p>
            <input
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mt-4 w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 py-3 text-center font-display text-2xl"
              aria-label="الإجابة"
            />
            {error && <p className="mt-2 text-sm text-coral">إجابة غير صحيحة، حاول مرة أخرى.</p>}
            <button type="submit" className="press mt-4 w-full rounded-2xl bg-coral px-5 py-3 font-display font-extrabold text-paper shadow-chunky-xs">
              دخول
            </button>
            <Link to="/" className="mt-4 flex items-center justify-center gap-1 text-sm text-ink/50">
              <ChevronRight className="size-4" /> رجوع
            </Link>
          </form>
        </div>
      </PageShell>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const profile = useProgress((s) => s.profile);
  const stars = useProgress((s) => s.stars);
  const streak = useProgress((s) => s.streakDays);
  const daily = useProgress((s) => s.daily);
  const items = useProgress((s) => s.items);
  const settings = useProgress((s) => s.settings);
  const updateSettings = useProgress((s) => s.updateSettings);
  const resetProgress = useProgress((s) => s.resetProgress);

  const minutes = useMemo(() => Object.values(daily).reduce((a, d) => a + d.minutes, 0), [daily]);
  const mastered = useMemo(
    () => LETTERS.filter((l) => (items[`letter:${l.id}`]?.mastery ?? 0) >= 2).length,
    [items],
  );

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-extrabold">لوحة الأهل</h1>
          <Link to="/" className="press rounded-2xl border-2 border-ink/10 bg-card px-4 py-2 font-bold shadow-chunky-xs">
            الرئيسية
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="النجوم" value={stars} />
          <Stat label="أيام متتالية" value={streak} />
          <Stat label="دقائق التعلّم" value={minutes} />
          <Stat label="حروف متقنة" value={`${mastered}/${LETTERS.length}`} />
        </div>

        <section className="mt-8 rounded-3xl border-2 border-ink/10 bg-card p-6 shadow-chunky">
          <h2 className="font-display text-xl font-extrabold">الإعدادات</h2>
          <p className="mt-1 text-sm text-ink/55">اسم الطفل: {profile.name}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => updateSettings({ sound: !settings.sound })}
              className="press rounded-2xl border-2 border-ink/10 bg-paper px-4 py-2 font-bold"
            >
              {settings.sound ? "كتم الصوت" : "تشغيل الصوت"}
            </button>
            <button
              type="button"
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="press rounded-2xl border-2 border-ink/10 bg-paper px-4 py-2 font-bold"
            >
              {settings.darkMode ? "الوضع الفاتح" : "الوضع الداكن"}
            </button>
            <button
              type="button"
              onClick={() => resetProgress()}
              className="press rounded-2xl bg-coral px-4 py-2 font-bold text-paper"
            >
              تصفير التقدّم
            </button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border-2 border-ink/10 bg-card p-5 shadow-chunky-sm">
      <p className="text-sm text-ink/55">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold">{value}</p>
    </div>
  );
}
