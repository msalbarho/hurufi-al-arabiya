import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/kids/PageShell";

export function ComingSoon({ title, subtitle, glyph }: { title: string; subtitle: string; glyph: string }) {
  return (
    <PageShell>
      <div className="mx-auto grid min-h-screen max-w-xl place-items-center px-6 text-center">
        <div>
          <span className="mx-auto grid size-28 place-items-center rounded-3xl bg-sun font-display text-6xl font-extrabold text-ink shadow-chunky">
            {glyph}
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold">{title}</h1>
          <p className="mt-3 text-ink/60">{subtitle}</p>
          <Link to="/" className="press mt-8 inline-block rounded-2xl bg-coral px-6 py-3 font-display font-extrabold text-paper shadow-chunky-xs">
            رجوع للرئيسية
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
