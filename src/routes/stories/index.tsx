import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/kids/ComingSoon";

export const Route = createFileRoute("/stories/")({
  head: () => ({
    meta: [
      { title: "القصص — حُرُوفِي العَرَبِيَّة" },
      { name: "description", content: "جزيرة القصص: اقرأ واستمع إلى قصص قصيرة للأطفال بالعربية." },
      { property: "og:title", content: "القصص — حُرُوفِي العَرَبِيَّة" },
      { property: "og:description", content: "اقرأ واستمع إلى قصص قصيرة للأطفال بالعربية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon glyph="ق" title="القصص" subtitle="جزيرة القصص قيد التحضير — قريباً جداً!" />,
});
