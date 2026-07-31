/**
 * Status-breakdown donut. Reuses the app's existing semantic status color
 * tokens (the same `text-*` classes StatusBadge already uses for
 * ACTIVE/PENDING/etc.) rather than introducing a new categorical palette —
 * identity here is "state", which the app already has a color language for.
 */

export type DonutSegment = { label: string; value: number; colorClass: string };

const SIZE = 140;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({ title, segments }: { title: string; segments: DonutSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let offset = 0;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No data yet.</p>
      ) : (
        <div className="flex items-center gap-6">
          <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0" role="img" aria-label={title}>
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              className="text-muted"
              stroke="currentColor"
              strokeWidth={STROKE}
              opacity={0.25}
            />
            {segments.map((s, idx) => {
              if (s.value === 0) return null;
              const fraction = s.value / total;
              const dash = fraction * CIRCUMFERENCE;
              const gap = CIRCUMFERENCE - dash;
              const el = (
                <circle
                  key={idx}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  className={s.colorClass}
                  stroke="currentColor"
                  strokeWidth={STROKE}
                  strokeDasharray={`${dash} ${gap}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                >
                  <title>{`${s.label}: ${s.value}`}</title>
                </circle>
              );
              offset += dash;
              return el;
            })}
            <text
              x={SIZE / 2}
              y={SIZE / 2}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-foreground"
              style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
            >
              {total}
            </text>
          </svg>

          <ul className="space-y-2 flex-1 min-w-0">
            {segments.map((s, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.colorClass}`} style={{ backgroundColor: "currentColor" }} />
                <span className="text-muted-foreground flex-1 truncate capitalize">{s.label.toLowerCase()}</span>
                <span className="text-foreground font-medium tabular-nums">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accessible data table alternative to the chart. */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr><th>Status</th><th>Count</th></tr>
        </thead>
        <tbody>
          {segments.map((s, idx) => (
            <tr key={idx}><td>{s.label}</td><td>{s.value}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
