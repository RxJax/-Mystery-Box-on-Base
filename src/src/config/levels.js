export const levels = Array.from({ length: 30 }, (_, i) => ({
  level: i + 1,
  targetScore: 100 * (i + 1) + Math.floor(Math.pow(i, 1.5)) * 50,
  maxMoves: Math.max(10, 25 - Math.floor(i / 3)),
}));
