/** Parent gate: a small arithmetic challenge a 4-year-old cannot solve. */
export interface GateChallenge {
  question: string;
  answer: number;
}

export function makeChallenge(): GateChallenge {
  const a = 6 + Math.floor(Math.random() * 7); // 6..12
  const b = 5 + Math.floor(Math.random() * 8); // 5..12
  const useMul = Math.random() > 0.5;
  if (useMul) {
    const x = 3 + Math.floor(Math.random() * 6); // 3..8
    const y = 3 + Math.floor(Math.random() * 6);
    return { question: `${x} × ${y}`, answer: x * y };
  }
  return { question: `${a} + ${b}`, answer: a + b };
}
