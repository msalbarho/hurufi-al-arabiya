import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/kids/ComingSoon";

export const Route = createFileRoute("/sentences/")({
  head: () => ({
    meta: [
      { title: "الجُمل — حُرُوفِي العَرَبِيَّة" },
      { name: "description", content: "جزيرة الجُمل: رتّب الكلمات لتكوين جُمل عربية بسيطة وممتعة." },
      { property: "og:title", content: "الجُمل — حُرُوفِي العَرَبِيَّة" },
      { property: "og:description", content: "رتّب الكلمات لتكوين جُمل عربية بسيطة وممتعة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon glyph="ج" title="الجُمل" subtitle="جزيرة الجُمل قيد التحضير — قريباً جداً!" />,
});
