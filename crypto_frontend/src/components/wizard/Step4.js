import React from "react";
import { Play } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  LabelList,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-950/95 border border-slate-700 rounded-xl px-3 py-2 shadow-xl shadow-black/40">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">
        {label}
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

function ValueLabel(props) {
  const { x, y, width, value, fill } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      fontSize={9}
      fontWeight={700}
      fill={fill}
    >
      {value.toFixed(2)}
    </text>
  );
}

export default function Step4({
  encBenchRunning,
  inputBuffer,
  runEncryptionBenchmark,
  encBenchAvg,
  rsaBits,
  eccCurve,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <p className="text-sm text-slate-400">
        Run encryption 30 times using RSA-OAEP + AES-GCM and ECC ECIES +
        AES-GCM to establish consistency and compute reliable averages.
      </p>

      <button
        disabled={encBenchRunning || !inputBuffer}
        onClick={runEncryptionBenchmark}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-950 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50"
      >
        <Play className="w-4 h-4" />
        {encBenchRunning
          ? "Benchmarking (30x)..."
          : "Run Encryption Benchmark"}
      </button>

      {encBenchAvg.length > 0 && (
        <div className="space-y-4">

          <div className="relative h-72 bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800/80 rounded-2xl p-4 overflow-hidden">
            {/* ambient glow accents */}
            <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={encBenchAvg}
                margin={{ top: 24, right: 10, left: -20, bottom: 0 }}
                barGap={6}
              >
                <defs>
                  <linearGradient id="rsaGradientEnc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                  <linearGradient id="eccGradientEnc" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="name"
                  stroke="#64748b"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={{ stroke: "#334155" }}
                  tickLine={false}
                />

                <YAxis
                  scale="sqrt"
                  domain={[0, "dataMax"]}
                  stroke="#64748b"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: "Average Time (ms)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#64748b",
                    fontSize: 10,
                    offset: 10,
                  }}
                />

                <ChartTooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(148, 163, 184, 0.06)" }}
                />

                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  iconType="circle"
                />

                <Bar
                  dataKey="RSA"
                  fill="url(#rsaGradientEnc)"
                  radius={[6, 6, 0, 0]}
                  name={`RSA-${rsaBits}`}
                  animationDuration={900}
                  animationEasing="ease-out"
                  maxBarSize={48}
                  minPointSize={4}
                >
                  <LabelList content={(p) => <ValueLabel {...p} fill="#67e8f9" />} />
                </Bar>

                <Bar
                  dataKey="ECC"
                  fill="url(#eccGradientEnc)"
                  radius={[6, 6, 0, 0]}
                  name={`ECC-${eccCurve}`}
                  animationDuration={900}
                  animationEasing="ease-out"
                  maxBarSize={48}
                  minPointSize={4}
                >
                  <LabelList content={(p) => <ValueLabel {...p} fill="#86efac" />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

          </div>

          <div className="grid grid-cols-2 gap-4 text-center">

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <p className="text-xl font-black text-cyan-400">
                {encBenchAvg[0].RSA.toFixed(3)} ms
              </p>

              <p className="text-[9px] uppercase font-bold text-slate-500 mt-1">
                RSA Average Encryption Time
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <p className="text-xl font-black text-emerald-400">
                {encBenchAvg[0].ECC.toFixed(3)} ms
              </p>

              <p className="text-[9px] uppercase font-bold text-slate-500 mt-1">
                ECC Average Encryption Time
              </p>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}