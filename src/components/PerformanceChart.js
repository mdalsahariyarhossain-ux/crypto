import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";

const data = [
  {
    securityBits: 112,
    rsaKeyBits: 2048,
    eccKeyBits: 224,
    rsaCost: 40,
    eccCost: 8
  },
  {
    securityBits: 128,
    rsaKeyBits: 3072,
    eccKeyBits: 256,
    rsaCost: 70,
    eccCost: 10
  },
  {
    securityBits: 192,
    rsaKeyBits: 7680,
    eccKeyBits: 384,
    rsaCost: 180,
    eccCost: 22
  },
  {
    securityBits: 256,
    rsaKeyBits: 15360,
    eccKeyBits: 521,
    rsaCost: 350,
    eccCost: 45
  }
];

export default function PerformanceChart() {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-4">

      <div>
        <h2 className="text-lg font-semibold text-sky-300">
          Cryptographic Performance Analysis
        </h2>
        <p className="text-xs text-slate-400">
          Side-by-side visualization of security equivalence and performance cost
          for RSA and ECC.
        </p>
      </div>

      {/* SIDE BY SIDE GRAPHS */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* LEFT: KEY SIZE vs SECURITY */}
        <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-200 mb-2">
            🔐 Key Size vs Security Level
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="securityBits"
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "Security level (bits)",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 10
                  }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "Key size (bits)",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 10
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1f2937",
                    fontSize: 11
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="rsaKeyBits"
                  name="RSA Key Size"
                  stroke="#38bdf8"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="eccKeyBits"
                  name="ECC Key Size"
                  stroke="#34d399"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            ECC achieves equivalent security using significantly smaller key sizes.
          </p>
        </div>

        {/* RIGHT: SECURITY vs PERFORMANCE */}
        <div className="bg-slate-900/70 rounded-xl p-3 border border-slate-700">
          <p className="text-sm font-semibold text-slate-200 mb-2">
            ⚡ Security Level vs Performance Cost
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="securityBits"
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "Security level (bits)",
                    position: "insideBottom",
                    offset: -5,
                    fontSize: 10
                  }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{
                    value: "Avg computation cost (ms)",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 10
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1f2937",
                    fontSize: 11
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="rsaCost"
                  name="RSA Cost"
                  stroke="#38bdf8"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="eccCost"
                  name="ECC Cost"
                  stroke="#34d399"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            ECC maintains lower computational cost as security increases.
          </p>
        </div>
      </div>
    </div>
  );
}
