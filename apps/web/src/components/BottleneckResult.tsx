import type { BottleneckPayload } from '@/lib/api';
import { cn } from '@/lib/cn';

import { BottleneckGauge } from './BottleneckGauge';
import { Pill } from './Pill';

interface BottleneckResultProps {
  result: BottleneckPayload;
}

const PROFILES = ['esports', 'aaa', 'vr', 'creative'] as const;
const RESOLUTIONS = ['1080p', '1440p', '4K'] as const;

const SEVERITY_BG: Record<BottleneckPayload['scenarios'][number]['severity'], string> = {
  optimal: 'bg-state-success/15 text-state-success border-state-success/30',
  minor: 'bg-state-success/10 text-emerald-300 border-emerald-300/30',
  moderate: 'bg-state-warning/15 text-amber-300 border-state-warning/30',
  significant: 'bg-state-warning/20 text-orange-300 border-orange-300/40',
  severe: 'bg-state-danger/15 text-red-300 border-state-danger/40',
};

export function BottleneckResult({ result }: BottleneckResultProps) {
  // Use 1440p AAA as headline scenario.
  const headline =
    result.scenarios.find((s) => s.resolution === '1440p' && s.profile === 'aaa') ??
    result.scenarios[0];

  if (!headline) return null;

  return (
    <section className="mt-10 space-y-8">
      <div className="grid gap-6 sm:grid-cols-[1fr_2fr]">
        <div className="card flex flex-col items-center justify-center">
          <BottleneckGauge
            percentage={headline.bottleneckPercentage}
            severity={headline.severity}
            label={`${headline.resolution} · ${headline.profile}`}
          />
          <p className="mt-2 text-sm text-slate-400">
            Limiting: <span className="font-mono uppercase">{headline.limitingComponent}</span>
          </p>
        </div>

        <div className="card flex flex-col justify-center">
          <p className="label mb-4">Power index (0–100)</p>
          <PowerBar
            label={`CPU: ${result.cpu.modelName}`}
            value={result.cpuPower}
            colorClass="bg-accent-purple"
          />
          <div className="mt-4">
            <PowerBar
              label={`GPU: ${result.gpu.modelName}`}
              value={result.gpuPower}
              colorClass="bg-cyan-400"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <p className="label mb-4">Scenario matrix</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="tracking-label text-left text-xs uppercase text-slate-400">
                <th className="px-3 py-2">Resolution</th>
                {PROFILES.map((p) => (
                  <th key={p} className="px-3 py-2 text-center">
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESOLUTIONS.map((res) => (
                <tr key={res} className="border-t border-white/5">
                  <td className="px-3 py-3 font-mono text-slate-300">{res}</td>
                  {PROFILES.map((profile) => {
                    const s = result.scenarios.find(
                      (x) => x.resolution === res && x.profile === profile,
                    );
                    if (!s)
                      return (
                        <td key={profile} className="px-3 py-3 text-slate-600">
                          —
                        </td>
                      );
                    return (
                      <td key={profile} className="px-3 py-3 text-center">
                        <div
                          className={cn(
                            'inline-flex flex-col items-center rounded-sm border px-3 py-1 text-xs',
                            SEVERITY_BG[s.severity],
                          )}
                        >
                          <span className="font-mono font-semibold">
                            {s.bottleneckPercentage.toFixed(1)}%
                          </span>
                          <span className="tracking-label mt-0.5 text-[10px] uppercase opacity-80">
                            {s.limitingComponent}
                          </span>
                          {s.expectedFpsRange && (
                            <span className="mt-1 text-[10px] text-slate-400">
                              {s.expectedFpsRange.min}–{s.expectedFpsRange.max} fps
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Thermal estimate"
          value={result.thermalEstimateC ? `${result.thermalEstimateC} °C` : '—'}
        />
        <Stat
          label="Power draw"
          value={result.totalPowerDrawW ? `${result.totalPowerDrawW} W` : '—'}
        />
        <Stat
          label="Recommended PSU"
          value={result.recommendedPsuW ? `${result.recommendedPsuW} W` : '—'}
        />
      </div>

      {result.recommendations.length > 0 && (
        <div className="card">
          <p className="label mb-3">Recommendations</p>
          <ul className="space-y-2 text-sm text-slate-300">
            {result.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-state-success mt-0.5 flex-shrink-0">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <Pill>algorithm {result.algorithmVersion}</Pill>
        {result.shareSlug && (
          <span className="font-mono">
            share: <span className="text-slate-300">{result.shareSlug}</span>
          </span>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className="metric mt-2">{value}</p>
    </div>
  );
}

function PowerBar({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  const pct = Math.max(3, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="truncate text-slate-300">{label}</span>
        <span className="ml-2 font-mono font-semibold text-white">{Math.round(value)}/100</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
