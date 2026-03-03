export function getScoreLabel(score: number, par: number): string {
  const diff = score - par;
  if (diff <= -3) return "Albatros";
  if (diff === -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double";
  if (diff === 3) return "Triple";
  return `+${diff}`;
}

export function getScoreColor(score: number, par: number): string {
  const diff = score - par;
  if (diff <= -2) return "#FFD700"; // gold - eagle or better
  if (diff === -1) return "#E74C3C"; // red - birdie
  if (diff === 0) return "#2ECC71"; // green - par
  if (diff === 1) return "#3498DB"; // blue - bogey
  if (diff === 2) return "#9B59B6"; // purple - double bogey
  return "#7F8C8D"; // grey - triple+
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function scoreToPar(totalScore: number, par: number): string {
  const diff = totalScore - par;
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : `${diff}`;
}
