export const round2 = (n: number) => {
  if (Number.isNaN(n) || !isFinite(n)) return 0
  return Number(n.toFixed(2))
}

export default round2
