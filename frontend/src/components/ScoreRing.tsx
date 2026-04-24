export default function ScoreRing({
  score,
  max = 5,
  size = 120,
  thickness = 10,
  label,
  theme = 'light',
}: {
  score: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: string;
  theme?: 'light' | 'dark';
}) {
  const pct = Math.max(0, Math.min(1, score / max));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);
  const color =
    score < 1 ? 'var(--score-0)' :
    score < 2 ? 'var(--score-1)' :
    score < 3 ? 'var(--score-2)' :
    score < 4 ? 'var(--score-3)' : 'var(--score-5)';
  const trackColor = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'var(--color-ink-100)';
  const labelColor = theme === 'dark' ? '#cbd5e1' : 'var(--color-ink-500)';
  const valueColor = theme === 'dark' ? '#f8fafc' : 'var(--color-ink-900)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={thickness} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color}
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        fill="none"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)' }}
      />
      <text
        x="50%" y="48%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.28}
        fontWeight={700}
        fill={valueColor}
      >
        {score.toFixed(2)}
      </text>
      {label && (
        <text
          x="50%" y="68%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.1}
          fill={labelColor}
          fontWeight={600}
          style={{ letterSpacing: '0.08em' }}
        >
          {label.toUpperCase()}
        </text>
      )}
    </svg>
  );
}
