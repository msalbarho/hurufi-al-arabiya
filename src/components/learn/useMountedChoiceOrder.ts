import { useEffect, useState } from "react";
import { hashString, shuffleWithSeed } from "@/lib/curriculum/choiceOrder.ts";

/**
 * SSR and the first client paint keep `ids` as given (hydration-safe).
 * After mount, permute once. No Math.random() during render.
 */
export function useMountedChoiceOrder(exerciseId: string, ids: readonly string[]): readonly string[] {
  const [order, setOrder] = useState<{ exerciseId: string; ids: string[] } | null>(null);

  useEffect(() => {
    const seed = (Date.now() ^ hashString(exerciseId)) >>> 0 || 1;
    setOrder({ exerciseId, ids: shuffleWithSeed(ids, seed) });
    // Shuffle is tied to the activity identity, not a new ids array each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);

  return order?.exerciseId === exerciseId ? order.ids : ids;
}
