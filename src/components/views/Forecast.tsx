import { useMemo, useState, useRef, useCallback } from 'react';
import { Calendar, TrendingDown, Info, AlertTriangle } from 'lucide-react';
import type { FinanceState } from '@/types';
import { computeForecast, computeMetrics } from '@/lib/calculations';
import { formatCurrency } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { DemoBadge } from '@/components/ui/Misc';

interface ForecastProps {
  state: FinanceState;
}

const VB_W = 800;
const VB_H = 300;
const PAD_L = 55;
const PAD_R = 15;
const PAD_T = 15;
const PAD_B = 30;
const CHART_W = VB_W - PAD_L - PAD_R;
const CHART_H = VB_H - PAD_T - PAD_B;

export function Forecast({ state }: ForecastProps) {
  const forecast = useMemo(() => computeForecast(state), [state]);
  const metrics = useMemo(() => computeMetrics(state), [state]);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const balances = forecast.map((f) => f.balance);
  const minBalance = Math.min(...balances);
  const maxBalance = Math.max(...balances);
  const yMin = Math.min(0, minBalance);
  const yMax = Math.max(0, maxBalance);
  const yRange = yMax - yMin || 1;

  const xForDay = (day: number) => PAD_L + ((day - 1) / 29) * CHART_W;
  const yForBalance = (balance: number) =>
    PAD_T + CHART_H - ((balance - yMin) / yRange) * CHART_H;

  const fullLinePath = forecast
    .map((f, i) => `${i === 0 ? 'M' : 'L'} ${xForDay(f.day).toFixed(1)} ${yForBalance(f.balance).toFixed(1)}`)
    .join(' ');

  const areaPath = `${fullLinePath} L ${xForDay(30).toFixed(1)} ${(PAD_T + CHART_H).toFixed(1)} L ${xForDay(1).toFixed(1)} ${(PAD_T + CHART_H).toFixed(1)} Z`;

  const daysElapsed = metrics.daysElapsed;

  const actualPoints = forecast.filter((f) => f.day <= daysElapsed);
  const projectedPoints = forecast.filter((f) => f.day >= daysElapsed);

  const actualLinePath = actualPoints
    .map((f, i) => `${i === 0 ? 'M' : 'L'} ${xForDay(f.day).toFixed(1)} ${yForBalance(f.balance).toFixed(1)}`)
    .join(' ');

  const projectedLinePath = projectedPoints
    .map((f, i) => `${i === 0 ? 'M' : 'L'} ${xForDay(f.day).toFixed(1)} ${yForBalance(f.balance).toFixed(1)}`)
    .join(' ');

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const span = yMax - yMin;
    const step = span > 10000 ? 2000 : span > 5000 ? 1000 : span > 2000 ? 500 : span > 1000 ? 200 : 100;
    for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) {
      ticks.push(v);
    }
    if (ticks.length === 0) ticks.push(yMin, yMax);
    return ticks;
  }, [yMin, yMax]);

  const xLabels = [1, 5, 10, 15, 20, 25, 30];

  const hoveredPoint = hoveredDay ? forecast.find((f) => f.day === hoveredDay) ?? null : null;
  const lowestDay = forecast.reduce((min, f) => (f.balance < min.balance ? f : min), forecast[0]);
  const hasNegativeProjection = minBalance < 0;

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = VB_W / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const day = Math.round(((mouseX - PAD_L) / CHART_W) * 29) + 1;
    setHoveredDay(Math.max(1, Math.min(30, day)));
  }, []);

  const tooltipLeftPct = hoveredPoint ? (xForDay(hoveredPoint.day) / VB_W) * 100 : 0;
  const tooltipTopPct = hoveredPoint ? (yForBalance(hoveredPoint.balance) / VB_H) * 100 : 0;
  const tooltipFlip = tooltipLeftPct > 75;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">30-Day Forecast</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Projected balance across the month, accounting for commitments and subscriptions.
        </p>
      </div>

      {hasNegativeProjection && (
        <div className="rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-950/30 px-4 py-3 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-red-700 dark:text-red-400">Projected shortfall detected. </span>
            <span className="text-red-600 dark:text-red-400">
              Your balance is projected to go negative on Day {lowestDay.day}. Consider reducing discretionary spending or increasing income.
            </span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader
          title="Balance Projection"
          icon={<Calendar size={16} />}
          action={
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                <span className="w-3 h-2 bg-emerald-500 rounded-sm" /> Actual
              </span>
              <span className="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                <span className="w-3 h-2 bg-gray-300 dark:bg-gray-600 rounded-sm" /> Projected
              </span>
            </div>
          }
        />
        <CardBody>
          <div className="relative w-full h-72">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredDay(null)}
              role="img"
              aria-label="30-day balance projection chart showing actual spending and projected future balance"
            >
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {yTicks.map((v) => (
                <g key={`y-${v}`}>
                  <line
                    x1={PAD_L}
                    x2={VB_W - PAD_R}
                    y1={yForBalance(v)}
                    y2={yForBalance(v)}
                    stroke="currentColor"
                    strokeWidth={0.5}
                    strokeDasharray={v === 0 ? '4 4' : '3 3'}
                    className={v === 0 ? 'text-red-500' : 'text-gray-200 dark:text-navy-700'}
                  />
                  <text
                    x={PAD_L - 8}
                    y={yForBalance(v) + 3}
                    textAnchor="end"
                    fontSize={10}
                    fill="currentColor"
                    className="text-gray-400 dark:text-gray-500"
                  >
                    {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  </text>
                </g>
              ))}

              {/* Zero reference line (emphasized) */}
              {yMin < 0 && (
                <line
                  x1={PAD_L}
                  x2={VB_W - PAD_R}
                  y1={yForBalance(0)}
                  y2={yForBalance(0)}
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}

              {/* "Today" reference line */}
              {daysElapsed > 0 && daysElapsed < 30 && (
                <line
                  x1={xForDay(daysElapsed + 1)}
                  x2={xForDay(daysElapsed + 1)}
                  y1={PAD_T}
                  y2={PAD_T + CHART_H}
                  stroke="#64748b"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
              )}
              {daysElapsed > 0 && daysElapsed < 30 && (
                <text
                  x={xForDay(daysElapsed + 1)}
                  y={PAD_T - 2}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#64748b"
                >
                  Today
                </text>
              )}

              {/* X-axis labels */}
              {xLabels.map((day) => (
                <text
                  key={`x-${day}`}
                  x={xForDay(day)}
                  y={VB_H - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill="currentColor"
                  className="text-gray-400 dark:text-gray-500"
                >
                  Day {day}
                </text>
              ))}

              {/* Area fill */}
              <path d={areaPath} fill="url(#balanceGradient)" />

              {/* Actual line (solid emerald) */}
              {actualLinePath && (
                <path d={actualLinePath} fill="none" stroke="#10b981" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              )}

              {/* Projected line (dashed gray) */}
              {projectedLinePath && (
                <path d={projectedLinePath} fill="none" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="5 3" strokeLinejoin="round" strokeLinecap="round" />
              )}

              {/* Hover indicator */}
              {hoveredPoint && (
                <g>
                  <line
                    x1={xForDay(hoveredPoint.day)}
                    x2={xForDay(hoveredPoint.day)}
                    y1={PAD_T}
                    y2={PAD_T + CHART_H}
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                    opacity={0.5}
                  />
                  <circle
                    cx={xForDay(hoveredPoint.day)}
                    cy={yForBalance(hoveredPoint.balance)}
                    r={4}
                    fill="#10b981"
                    stroke="white"
                    strokeWidth={2}
                  />
                </g>
              )}
            </svg>

            {/* Tooltip overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-10 pointer-events-none rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 shadow-lg"
                style={{
                  left: `${tooltipLeftPct}%`,
                  top: `${tooltipTopPct}%`,
                  transform: tooltipFlip
                    ? 'translate(-100%, -110%)'
                    : 'translate(0, -110%)',
                }}
              >
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">{hoveredPoint.label}</div>
                <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(hoveredPoint.balance)}
                </div>
                {hoveredPoint.commitmentLabel && (
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    {hoveredPoint.commitmentLabel}
                  </div>
                )}
                {hoveredPoint.isActual && (
                  <div className="text-[10px] text-gray-400 mt-0.5">Actual</div>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Hovered day detail + key points */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader title="Selected Day" icon={<Info size={16} />} />
          <CardBody>
            {hoveredPoint ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{hoveredPoint.label}</span>
                  {hoveredPoint.isActual && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-semibold">
                      Past
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-gray-700 dark:text-gray-200">
                  Balance: {formatCurrency(hoveredPoint.balance)}
                </div>
                {hoveredPoint.hasCommitment && hoveredPoint.commitmentLabel && (
                  <div className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Calendar size={14} />
                    Deduction: {hoveredPoint.commitmentLabel}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-3">
                Hover over the chart to see projected balance for any day.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Key Milestones" icon={<TrendingDown size={16} />} />
          <CardBody className="pt-0">
            <div className="divide-y divide-gray-50 dark:divide-navy-700">
              <MilestoneRow label="Peak balance" day={forecast.reduce((max, f) => (f.balance > max.balance ? f : max)).day} amount={maxBalance} />
              <MilestoneRow label="Lowest point" day={lowestDay.day} amount={minBalance} negative={minBalance < 0} />
              <MilestoneRow label="Day 30 ending" day={30} amount={forecast[29].balance} negative={forecast[29].balance < 0} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Upcoming deductions */}
      <Card>
        <CardHeader title="Upcoming Deductions in Forecast" icon={<Calendar size={16} />} />
        <CardBody className="pt-0">
          {forecast.filter((f) => f.hasCommitment && !f.isActual).length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-3 text-center">
              No upcoming deductions scheduled.
            </p>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-navy-700">
              {forecast
                .filter((f) => f.hasCommitment && !f.isActual)
                .map((f) => {
                  const item = [...state.commitments, ...state.subscriptions].find(
                    (c) => c.dueDay === f.day && c.name === f.commitmentLabel
                  );
                  return (
                    <div key={f.day} className="flex items-center gap-3 py-2.5">
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                        <Calendar size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{f.commitmentLabel}</span>
                          {item?.isDemo && <DemoBadge />}
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{f.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {formatCurrency(item?.amount || 0)}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Assumptions */}
      <div className="rounded-xl bg-gray-50 dark:bg-navy-800/50 border border-gray-100 dark:border-navy-700 p-4">
        <div className="flex items-start gap-2.5">
          <Info size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-semibold text-gray-600 dark:text-gray-300">Assumptions</p>
            <p>• Forecast deducts unpaid commitments and subscriptions on their due days.</p>
            <p>• No new transactions are assumed beyond what's already recorded.</p>
            <p>• Actual days reflect your real spending up to today; future days are projected.</p>
            <p>• Savings contributions are tracked separately and do not reduce your balance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MilestoneRow({ label, day, amount, negative }: { label: string; day: number; amount: number; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <div className="text-right">
        <div className={`text-sm font-bold ${negative ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-200'}`}>
          {formatCurrency(amount)}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">Day {day}</div>
      </div>
    </div>
  );
}
