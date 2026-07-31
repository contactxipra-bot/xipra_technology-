/**
 * Single-series magnitude chart (certificates issued per month). One accent
 * hue, thin bars with rounded data-ends anchored to the baseline, a recessive
 * baseline (no gridlines), and native <title> tooltips for hover detail.
 */

export type BarPoint = { label: string; value: number };

const HEIGHT = 140;
const BAR_RADIUS = 4;

export default function BarChart({ title, points }: { title: string; points: BarPoint[] }) {
  const max = Math.max(1, ...points.map((p) => p.value));

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">Last {points.length} months</span>
      </div>

      {points.every((p) => p.value === 0) ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No certificates issued yet.</p>
      ) : (
        <div
          className="flex items-end gap-3"
          style={{ height: HEIGHT }}
          role="img"
          aria-label={`${title}: ${points.map((p) => `${p.label} ${p.value}`).join(", ")}`}
        >
          {points.map((p, idx) => {
            const barHeight = Math.max(3, (p.value / max) * (HEIGHT - 24));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full flex-1 flex items-end">
                  <div
                    title={`${p.label}: ${p.value}`}
                    className="w-full bg-primary/80 group-hover:bg-primary transition-colors"
                    style={{ height: barHeight, borderRadius: `${BAR_RADIUS}px ${BAR_RADIUS}px 0 0` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground tabular-nums">{p.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible data table alternative to the chart. */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr><th>Month</th><th>Certificates issued</th></tr>
        </thead>
        <tbody>
          {points.map((p, idx) => (
            <tr key={idx}><td>{p.label}</td><td>{p.value}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
