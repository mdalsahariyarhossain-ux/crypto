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
  { securityBits: 112, rsaKeyBits: 2048, eccKeyBits: 224 },
  { securityBits: 128, rsaKeyBits: 3072, eccKeyBits: 256 },
  { securityBits: 192, rsaKeyBits: 7680, eccKeyBits: 384 },
  { securityBits: 256, rsaKeyBits: 15360, eccKeyBits: 521 }
];

function PerformanceChart() {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-900/40">
      <h2 className="text-lg font-semibold mb-1">Key Size vs Security Level</h2>
      <p className="text-xs text-slate-400 mb-4">
        Rough comparison between RSA and ECC key sizes for equivalent security levels.
      </p>

      <div className="h-64 bg-slate-900/60 rounded-xl p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="securityBits"
              tick={{ fontSize: 10 }}
              label={{
                value: "Approx. security (bits)",
                position: "insideBottom",
                offset: -4,
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
              name="RSA key size"
              stroke="#0ea5e9"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="eccKeyBits"
              name="ECC key size"
              stroke="#22c55e"
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        ECC achieves similar security with dramatically smaller keys compared to RSA,
        which directly affects storage, bandwidth, and performance.
      </p>
    </div>
  );
}
export default PerformanceChart;
