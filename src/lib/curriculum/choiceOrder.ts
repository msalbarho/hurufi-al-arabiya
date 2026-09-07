/**
 * Deterministic choice permutation for live lessons.
 * Do not call with Math.random() during render — that breaks SSR hydration.
 */

/** FNV-1a. Stable seed material — not a live-key. */
export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Deterministic Fisher–Yates. Call after mount (or in tests) with a seed. */
export function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let state = seed >>> 0 || 1;
  const next = () => {
    state += 0x6d2b79f5;
    let r = Math.imul(state ^ (state >>> 15), 1 | state);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    const current = out[i];
    const swap = out[j];
    if (current === undefined || swap === undefined) continue;
    out[i] = swap;
    out[j] = current;
  }
  return out;
}
