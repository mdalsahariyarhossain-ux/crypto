import React, { useState } from "react";

/* -------------------------------------------------
   ALGORITHMS (industry-accepted security mapping)
------------------------------------------------- */
const ALGORITHMS = [
  {
    id: "RSA2048",
    name: "RSA-2048",
    type: "RSA",
    securityBits: 112,
    bits: 2048,
  },
  {
    id: "RSA3072",
    name: "RSA-3072",
    type: "RSA",
    securityBits: 128,
    bits: 3072,
  },
  {
    id: "P256",
    name: "ECC P-256",
    type: "ECC",
    securityBits: 128,
    curve: "P-256",
  },
  {
    id: "P384",
    name: "ECC P-384",
    type: "ECC",
    securityBits: 192,
    curve: "P-384",
  },
];

/* -------------------------------------------------
   REAL CRYPTO WORKLOAD
------------------------------------------------- */
async function runCryptoWork(algo) {
  const data = new TextEncoder().encode("security-efficiency");
  const start = performance.now();

  if (algo.type === "RSA") {
    const key = await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: algo.bits,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    );

    const sig = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key.privateKey,
      data
    );

    await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key.publicKey,
      sig,
      data
    );
  } else {
    const key = await crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: algo.curve },
      true,
      ["sign", "verify"]
    );

    const sig = await crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" },
      key.privateKey,
      data
    );

    await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      key.publicKey,
      sig,
      data
    );
  }

  return performance.now() - start;
}

/* -------------------------------------------------
   PAGE
------------------------------------------------- */
export default function SecurityEfficiencyLab() {
  const [selected, setSelected] = useState(ALGORITHMS[0]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  async function runTest() {
    setRunning(true);
    setResult(null);

    const time = await runCryptoWork(selected);
    const efficiency = selected.securityBits / time;

    setResult({
      name: selected.name,
      securityBits: selected.securityBits,
      time,
      efficiency,
    });

    setRunning(false);
  }

  return (
    <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">

      {/* LEFT SIDE */}
      <div className="space-y-6">

        {/* INTRO */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <h1 className="text-xl font-bold text-sky-400 mb-2">
            🔐 Security Efficiency Lab
          </h1>
          <p className="text-sm text-slate-400">
            This experiment measures how efficiently a cryptographic algorithm
            converts computation time into real security.
          </p>
        </div>

        {/* SELECTION */}
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-3">
          <p className="text-xs text-slate-400">Select Algorithm</p>

          <div className="grid grid-cols-2 gap-2">
            {ALGORITHMS.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={`px-3 py-2 text-xs rounded-xl border ${
                  selected.id === a.id
                    ? "bg-sky-500 text-white border-sky-400"
                    : "bg-slate-800 text-slate-300 border-slate-600"
                }`}
              >
                {a.name}
              </button>
            ))}
          </div>

          <button
            disabled={running}
            onClick={runTest}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-xs font-bold disabled:opacity-60"
          >
            {running ? "Running Crypto Test…" : "Run Security Efficiency Test"}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div>
        {result ? (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-3 h-full">
            <h2 className="text-sky-400 font-semibold text-lg">
              Result Summary
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Algorithm</div>
                <div className="font-semibold">{result.name}</div>
              </div>

              <div>
                <div className="text-slate-400">Security Strength</div>
                <div className="font-semibold">
                  {result.securityBits} bits
                </div>
              </div>

              <div>
                <div className="text-slate-400">Execution Time</div>
                <div className="font-semibold">
                  {result.time.toFixed(2)} ms
                </div>
              </div>

              <div>
                <div className="text-slate-400">Security Efficiency</div>
                <div className="font-bold text-emerald-400 text-lg">
                  {result.efficiency.toFixed(2)}
                </div>
              </div>
            </div>

            <p className="text-[12px] text-slate-400">
              Higher efficiency means more security delivered per millisecond of computation.
            </p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center border border-dashed border-slate-700 rounded-2xl text-slate-500 text-sm">
            Run a test to see results
          </div>
        )}
      </div>
    </div>
  );
}
