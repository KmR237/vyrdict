const COLORS = {
  good: "#0d9488",
  medium: "#f59e0b",
  bad: "#dc2626",
} as const;

const LABELS = {
  good: "Bon état",
  medium: "À surveiller",
  bad: "Critique",
} as const;

function getLevel(score: number): "good" | "medium" | "bad" {
  if (score >= 70) return "good";
  if (score >= 40) return "medium";
  return "bad";
}

export function ScoreGauge({ score, size = "lg" }: { score: number; size?: "sm" | "lg" }) {
  const level = getLevel(score);
  const dim = size === "sm" ? "w-14 h-14" : "w-32 h-32";
  const textSize = size === "sm" ? "text-sm" : "text-4xl";

  return (
    <div className={`relative ${dim}`}>
      <svg viewBox="0 0 100 100" role="img" aria-label={"Score de santé: " + score + " sur 100"} className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-stone-100" strokeWidth={size === "sm" ? "8" : "6"} />
        <circle
          cx="50" cy="50" r="42" fill="none"
          stroke={COLORS[level]}
          strokeWidth={size === "sm" ? "8" : "6"}
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 264} 264`}
          className={size === "lg" ? "animate-gauge" : ""}
        />
      </svg>
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${size === "lg" ? "animate-count" : ""}`}>
        <span className={`${textSize} font-extrabold`}>{score}</span>
        {size === "lg" && (
          <>
            <span className="text-[10px] text-muted font-medium">/100</span>
            <span className="text-[10px] font-semibold mt-0.5" style={{ color: COLORS[level] }}>{LABELS[level]}</span>
          </>
        )}
      </div>
    </div>
  );
}
