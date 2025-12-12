interface ExperienceBarProps {
  /** Experience value between 0 and 1 (e.g., 0.5 = 50%) */
  experience: number;
}

/**
 * Full-width experience progress bar displayed at the bottom of the screen.
 * Shows character experience as a percentage with a blue-ish background
 * and gray-ish progress fill.
 */
export default function ExperienceBar({ experience }: ExperienceBarProps) {
  // Ensure experience is between 0 and 1
  const normalizedExp = Math.max(0, Math.min(1, experience));
  const percentage = (normalizedExp * 100).toFixed(1);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 w-full h-6 bg-blue-800 z-50"
      role="progressbar"
      aria-valuenow={normalizedExp * 100}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Experience: ${percentage}%`}
    >
      {/* Progress fill */}
      <div
        className="h-full bg-gray-300 transition-all duration-300"
        style={{ width: `${normalizedExp * 100}%` }}
      />
      {/* Percentage text centered - dark blue text with white outline for readability */}
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-blue-900 drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]">
        {percentage}%
      </span>
    </div>
  );
}
