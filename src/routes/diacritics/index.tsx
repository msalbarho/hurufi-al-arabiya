import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/kids/ComingSoon";

export const Route = createFileRoute("/diacritics/")({
  head: () => ({
    meta: [
      { title: "الحركات — حُرُوفِي العَرَبِيَّة" },
      { name: "description", content: "جزيرة الحركات: تدرّب على الفتحة والكسرة والضمّة بطريقة ممتعة." },
      { property: "og:title", content: "الحركات — حُرُوفِي العَرَبِيَّة" },
      { property: "og:description", content: "تدرّب على الفتحة والكسرة والضمّة بطريقة ممتعة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon glyph="ش" title="الحركات" subtitle="جزيرة الحركات قيد التحضير — قريباً جداً!" />,
});
