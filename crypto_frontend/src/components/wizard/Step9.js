import React from "react";

export default function Step9({
  rsaBits,
  keyConfig,
  keyTimes,
  encBenchAvg,
  decBenchAvg,
  sigBenchData,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <p className="text-sm text-slate-400">
        Review the overall benchmark summary for RSA and ECC.
      </p>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
          Performance Summary
        </h4>

        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="py-2 text-slate-400">Metric</th>
              <th className="py-2 text-cyan-400 text-center">
                RSA-{rsaBits}
              </th>
              <th className="py-2 text-emerald-400 text-center">
                ECC-{keyConfig === "A" ? "P-256" : "P-384"}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            <tr>
              <td className="py-2">Key Generation</td>
              <td className="py-2 text-center">
                {keyTimes ? `${keyTimes.rsa.toFixed(2)} ms` : "N/A"}
              </td>
              <td className="py-2 text-center">
                {keyTimes ? `${keyTimes.ecc.toFixed(2)} ms` : "N/A"}
              </td>
            </tr>

            <tr>
              <td className="py-2">Encryption (30 Runs)</td>
              <td className="py-2 text-center">
                {encBenchAvg.length
                  ? `${encBenchAvg[0].RSA.toFixed(3)} ms`
                  : "N/A"}
              </td>
              <td className="py-2 text-center">
                {encBenchAvg.length
                  ? `${encBenchAvg[0].ECC.toFixed(3)} ms`
                  : "N/A"}
              </td>
            </tr>

            <tr>
              <td className="py-2">Decryption (30 Runs)</td>
              <td className="py-2 text-center">
                {decBenchAvg.length
                  ? `${decBenchAvg[0].RSA.toFixed(3)} ms`
                  : "N/A"}
              </td>
              <td className="py-2 text-center">
                {decBenchAvg.length
                  ? `${decBenchAvg[0].ECC.toFixed(3)} ms`
                  : "N/A"}
              </td>
            </tr>

            <tr>
              <td className="py-2">Signing (20 Runs)</td>
              <td className="py-2 text-center">
                {sigBenchData.find(x => x.name === "Signing")
                  ? `${sigBenchData.find(x => x.name === "Signing").RSA.toFixed(3)} ms`
                  : "N/A"}
              </td>
              <td className="py-2 text-center">
                {sigBenchData.find(x => x.name === "Signing")
                  ? `${sigBenchData.find(x => x.name === "Signing").ECC.toFixed(3)} ms`
                  : "N/A"}
              </td>
            </tr>

            <tr>
              <td className="py-2">Verification (20 Runs)</td>
              <td className="py-2 text-center">
                {sigBenchData.find(x => x.name === "Verification")
                  ? `${sigBenchData.find(x => x.name === "Verification").RSA.toFixed(3)} ms`
                  : "N/A"}
              </td>
              <td className="py-2 text-center">
                {sigBenchData.find(x => x.name === "Verification")
                  ? `${sigBenchData.find(x => x.name === "Verification").ECC.toFixed(3)} ms`
                  : "N/A"}
              </td>
            </tr>

            <tr>
              <td className="py-2">Security Level</td>
              <td className="py-2 text-center font-semibold text-cyan-400">
                {rsaBits} bits
              </td>
              <td className="py-2 text-center font-semibold text-emerald-400">
                {keyConfig === "A" ? "256 bits" : "384 bits"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}