import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-950/95 border border-slate-700 rounded-xl px-3 py-2 shadow-xl shadow-black/40">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">
        Run {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="flex items-center gap-2 text-xs font-semibold"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="text-slate-200 ml-auto">
            {entry.value.toFixed(3)} ms
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Step5({
  encBenchRaw,
  rsaBits,
  eccCurve,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <p className="text-sm text-slate-400">
        Visualize run-by-run processing times across the 30 encryption
        benchmarks. This highlights stability, cache impacts, and consistent
        performance differences.
      </p>

      {encBenchRaw.length > 0 ? (
        <div className="relative h-72 bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800/80 rounded-2xl p-4 overflow-hidden">
          {/* ambient glow accents */}
          <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={encBenchRaw}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="rsaLineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#67e8f9" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
                <linearGradient id="eccLineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#1e293b"
                strokeDasharray="4 8"
                vertical={false}
              />

              <XAxis
                dataKey="run"
                stroke="#64748b"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                axisLine={{ stroke: "#334155" }}
                tickLine={false}
              />

              <YAxis
                scale="sqrt"
                domain={[0, "dataMax"]}
                stroke="#64748b"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />

              <ChartTooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#475569", strokeDasharray: "3 3" }}
              />

              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                iconType="circle"
              />

              <Line
                type="monotone"
                dataKey="RSA"
                stroke="url(#rsaLineGlow)"
                strokeWidth={2.5}
                name={`RSA-${rsaBits}`}
                dot={{ r: 2.5, fill: "#67e8f9", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                animationDuration={900}
                animationEasing="ease-out"
              />

              <Line
                type="monotone"
                dataKey="ECC"
                stroke="url(#eccLineGlow)"
                strokeWidth={2.5}
                name={`ECC-${eccCurve}`}
                dot={{ r: 2.5, fill: "#86efac", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                animationDuration={900}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
          Please run the benchmark in Step 4 first to generate data.
        </div>
      )}
    </div>
  );
}