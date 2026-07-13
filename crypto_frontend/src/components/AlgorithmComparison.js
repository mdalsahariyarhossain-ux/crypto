import React from "react";

function AlgorithmComparison() {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-sm space-y-4">

      <h2 className="text-lg font-bold text-sky-300">
        ⚖️ Core Cryptographic Comparison (RSA vs ECC)
      </h2>

      {/* BASIC TECH COMPARISON */}
      <table className="w-full text-xs border border-slate-700">
        <thead className="bg-slate-900 text-slate-300">
          <tr>
            <th className="border p-2">Feature</th>
            <th className="border p-2">RSA</th>
            <th className="border p-2">ECC</th>
          </tr>
        </thead>
        <tbody className="text-slate-400">
          <tr>
            <td className="border p-2">Mathematical Basis</td>
            <td className="border p-2">Prime Factorization</td>
            <td className="border p-2">Elliptic Curve Discrete Log</td>
          </tr>
          <tr>
            <td className="border p-2">Key Size (Equal Security)</td>
            <td className="border p-2">2048–4096 bits</td>
            <td className="border p-2">224–384 bits</td>
          </tr>
          <tr>
            <td className="border p-2">Speed</td>
            <td className="border p-2">Slower</td>
            <td className="border p-2">Much Faster</td>
          </tr>
          <tr>
            <td className="border p-2">Power Usage</td>
            <td className="border p-2">High</td>
            <td className="border p-2">Low (best for mobile)</td>
          </tr>
          <tr>
            <td className="border p-2">Certificate Size</td>
            <td className="border p-2">Large</td>
            <td className="border p-2">Small</td>
          </tr>
        </tbody>
      </table>

      {/* REAL WORLD MAPPING */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-2">
        <h3 className="font-semibold text-emerald-300">🌍 Real-World Usage</h3>
        <ul className="list-disc ml-5 text-slate-300 space-y-1">
          <li><b>HTTPS (Websites):</b> RSA (legacy), ECC (modern ECDHE)</li>
          <li><b>WhatsApp, Signal:</b> ECC (Curve25519)</li>
          <li><b>Crypto Wallets:</b> ECC only (secp256k1)</li>
          <li><b>Banking Apps:</b> ECC + AES</li>
        </ul>
      </div>

      {/* LOGIN vs CHAT vs PAYMENTS */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
        <h3 className="font-semibold text-violet-300 mb-2">
          🔐 Login, Chat & Payments
        </h3>

        <table className="w-full text-xs border border-slate-700">
          <thead className="bg-slate-800 text-slate-300">
            <tr>
              <th className="border p-2">System</th>
              <th className="border p-2">RSA</th>
              <th className="border p-2">ECC</th>
            </tr>
          </thead>
          <tbody className="text-slate-400">
            <tr>
              <td className="border p-2">Website Login</td>
              <td className="border p-2">✅ Widely Used</td>
              <td className="border p-2">✅ Growing</td>
            </tr>
            <tr>
              <td className="border p-2">Secure Messaging</td>
              <td className="border p-2">❌ Too Slow</td>
              <td className="border p-2">✅ Best Choice</td>
            </tr>
            <tr>
              <td className="border p-2">Digital Payments</td>
              <td className="border p-2">⚠️ Server Only</td>
              <td className="border p-2">✅ Mobile + Web</td>
            </tr>
            <tr>
              <td className="border p-2">Blockchain</td>
              <td className="border p-2">❌ Not Used</td>
              <td className="border p-2">✅ Mandatory</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PERFORMANCE */}
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
        <h3 className="font-semibold text-red-300">⚡ Performance & Efficiency</h3>
        <ul className="list-disc ml-5 text-slate-300 mt-2 space-y-1">
          <li>ECC is 5–10× faster than RSA for key exchange.</li>
          <li>ECC consumes less battery on mobile devices.</li>
          <li>RSA creates heavy CPU load on large servers.</li>
        </ul>
      </div>

      {/* FINAL DECISION */}
      <div className="bg-gradient-to-r from-sky-600 to-emerald-600 text-white rounded-lg p-3">
        <h3 className="font-bold mb-1">✅ Final Technical Decision</h3>
        <p>
          Choose <b>RSA</b> for legacy certificates and old web systems.  
          Choose <b>ECC</b> for modern mobile apps, messaging systems, digital payments,
          and blockchain platforms.
        </p>
      </div>

    </div>
  );
}

export default AlgorithmComparison;
