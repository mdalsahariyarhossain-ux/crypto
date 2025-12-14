// src/components/RsaEccBenchmarkPanel.js
import React, { useState } from "react";

const RUNS = 20;

// --------------------------------------------
// Utility
// --------------------------------------------
function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;
}

// --------------------------------------------
// RSA BENCHMARK
// --------------------------------------------
async function liveRSA(bits, onProgress) {
  const algo = {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: bits,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  };

  const encoder = new TextEncoder();
  const data = encoder.encode("benchmark");

  let kg = [], sg = [], vf = [];
  let keyPair, lastSig;

  // Keygen
  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    keyPair = await crypto.subtle.generateKey(algo, true, ["sign", "verify"]);
    const t1 = performance.now();
    kg.push(t1 - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  // Sign
  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    lastSig = await crypto.subtle.sign(algo.name, keyPair.privateKey, data);
    const t1 = performance.now();
    sg.push(t1 - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  // Verify
  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    await crypto.subtle.verify(algo.name, keyPair.publicKey, lastSig, data);
    const t1 = performance.now();
    vf.push(t1 - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  return { keygen: avg(kg), sign: avg(sg), verify: avg(vf) };
}

// --------------------------------------------
// ECC BENCHMARK
// --------------------------------------------
async function liveECC(curve, onProgress) {
  const algo = { name: "ECDSA", namedCurve: curve };
  const signParams = { name: "ECDSA", hash: "SHA-256" };

  const encoder = new TextEncoder();
  const data = encoder.encode("benchmark");

  let kg = [], sg = [], vf = [];
  let keyPair, lastSig;

  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    keyPair = await crypto.subtle.generateKey(algo, true, ["sign", "verify"]);
    const t1 = performance.now();
    kg.push(t1 - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    lastSig = await crypto.subtle.sign(signParams, keyPair.privateKey, data);
    const t1 = performance.now();
    sg.push(t1 - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    await crypto.subtle.verify(signParams, keyPair.publicKey, lastSig, data);
    const t1 = performance.now();
    vf.push(t1 - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  return { keygen: avg(kg), sign: avg(sg), verify: avg(vf) };
}

// --------------------------------------------
// MAIN COMPONENT (OPTION 2 – SPLIT UI)
// --------------------------------------------
export default function RsaEccBenchmarkPanel() {
  const OPTIONS = [
    { id: "RSA2048", label: "RSA-2048", algo: "RSA", bits: 2048 },
    { id: "RSA3072", label: "RSA-3072", algo: "RSA", bits: 3072 },
    { id: "P256", label: "ECC P-256", algo: "ECC", curve: "P-256" },
    { id: "P384", label: "ECC P-384", algo: "ECC", curve: "P-384" },
  ];

  const [mode, setMode] = useState("single");
  const [singleId, setSingleId] = useState("RSA2048");

  const [compareA, setCompareA] = useState("RSA2048");
  const [compareB, setCompareB] = useState("P256");

  const [progressA, setProgressA] = useState({ keygen: 0, sign: 0, verify: 0 });
  const [progressB, setProgressB] = useState({ keygen: 0, sign: 0, verify: 0 });

  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const getCfg = (id) => OPTIONS.find((x) => x.id === id);

  async function runBenchmark() {
    setRunning(true);
    setResult(null);
    setProgressA({ keygen: 0, sign: 0, verify: 0 });
    setProgressB({ keygen: 0, sign: 0, verify: 0 });

    if (mode === "single") {
      const cfg = getCfg(singleId);
      const res =
        cfg.algo === "RSA"
          ? await liveRSA(cfg.bits, setProgressA)
          : await liveECC(cfg.curve, setProgressA);

      setResult({ mode: "single", cfg, res });
    } else {
      const A = getCfg(compareA);
      const B = getCfg(compareB);

      const p1 =
        A.algo === "RSA"
          ? liveRSA(A.bits, setProgressA)
          : liveECC(A.curve, setProgressA);

      const p2 =
        B.algo === "RSA"
          ? liveRSA(B.bits, setProgressB)
          : liveECC(B.curve, setProgressB);

      const [outA, outB] = await Promise.all([p1, p2]);

      setResult({
        mode: "compare",
        A: { cfg: A, res: outA },
        B: { cfg: B, res: outB },
      });
    }

    setRunning(false);
  }

  const maxBar = Math.max(
    progressA.keygen,
    progressA.sign,
    progressA.verify,
    progressB.keygen,
    progressB.sign,
    progressB.verify,
    0.0001
  );

  const barHeight = (v) => `${(v / maxBar) * 100}%`;

  return (
    <div className="grid lg:grid-cols-2 gap-6">

      {/* -------------------------------- LEFT PANEL -------------------------------- */}
      <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl space-y-5 shadow-lg shadow-slate-900/40">

        <h2 className="text-sky-300 text-lg font-semibold flex items-center gap-2">
          ⚡ Crypto Run
        </h2>

        {/* MODE SELECTOR */}
        <div className="flex gap-3">
          <button
            onClick={() => setMode("single")}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              mode === "single"
                ? "bg-sky-500 text-white shadow"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Single Test
          </button>

          <button
            onClick={() => setMode("compare")}
            className={`px-3 py-1 rounded text-xs font-semibold ${
              mode === "compare"
                ? "bg-emerald-500 text-white shadow"
                : "bg-slate-800 text-slate-300"
            }`}
          >
            Compare
          </button>
        </div>

        {/* SINGLE MODE OPTIONS */}
        {mode === "single" && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Choose Algorithm</p>

            <div className="grid grid-cols-2 gap-2">
              {OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSingleId(o.id)}
                  className={`px-3 py-2 rounded border text-xs ${
                    o.id === singleId
                      ? "bg-sky-500 text-white border-sky-300"
                      : "bg-slate-800 text-slate-300 border-slate-600"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* COMPARE MODE OPTIONS */}
        {mode === "compare" && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Algorithm A</p>
              <select
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className="bg-slate-800 border border-slate-600 p-2 text-xs rounded w-full"
              >
                {OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-1">Algorithm B</p>
              <select
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className="bg-slate-800 border border-slate-600 p-2 text-xs rounded w-full"
              >
                {OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* RUN BUTTON */}
        <button
          disabled={running}
          onClick={runBenchmark}
          className="w-full py-2 rounded bg-gradient-to-r from-sky-500 to-emerald-500 font-bold text-xs shadow disabled:opacity-60"
        >
          {running ? "Running…" : "Run"}
        </button>

      </div>

      {/* -------------------------------- RIGHT PANEL -------------------------------- */}
      <div className="bg-slate-900 border border-slate-700 p-5 rounded-xl shadow-xl shadow-slate-900/50 space-y-6">

        <h3 className="text-slate-300 text-sm font-semibold">
          Live Performance Graph
        </h3>

        {/* LIVE BAR GRAPH */}
        <div className="h-48 flex items-end justify-between px-6">

          {["keygen", "sign", "verify"].map((op) => (
            <div key={op} className="flex flex-col items-center flex-1 mx-2">

              <div className="flex items-end gap-2 h-28 w-full justify-center">
                <div
                  className="w-6 bg-sky-500 rounded transition-all duration-200"
                  style={{ height: barHeight(progressA[op]) }}
                ></div>

                {mode === "compare" && (
                  <div
                    className="w-6 bg-emerald-500 rounded transition-all duration-200"
                    style={{ height: barHeight(progressB[op]) }}
                  ></div>
                )}
              </div>

              {/* LIVE VALUE */}
              <div className="text-[11px] text-slate-400 mt-1">
                {mode === "single"
                  ? `${progressA[op].toFixed(2)} ms`
                  : `A:${progressA[op].toFixed(
                      2
                    )} | B:${progressB[op].toFixed(2)} ms`}
              </div>

              <div className="uppercase text-[10px] text-slate-500 tracking-wide">
                {op}
              </div>
            </div>
          ))}
        </div>

        {/* FINAL RESULT CARD */}
        {result && (
          <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl text-[12px] space-y-3">

            {/* SINGLE RESULT */}
            {result.mode === "single" && (
              <>
                <b className="text-sky-400">{result.cfg.label}</b>
                <div>KeyGen: {result.res.keygen.toFixed(2)} ms</div>
                <div>Sign: {result.res.sign.toFixed(2)} ms</div>
                <div>Verify: {result.res.verify.toFixed(2)} ms</div>
              </>
            )}

            {/* COMPARE RESULT */}
            {result.mode === "compare" && (
              <>
                <div className="text-sky-400 font-bold">
                  {result.A.cfg.label} vs {result.B.cfg.label}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <b>{result.A.cfg.label}</b>
                    <div>KeyGen: {result.A.res.keygen.toFixed(2)} ms</div>
                    <div>Sign: {result.A.res.sign.toFixed(2)} ms</div>
                    <div>Verify: {result.A.res.verify.toFixed(2)} ms</div>
                  </div>

                  <div>
                    <b>{result.B.cfg.label}</b>
                    <div>KeyGen: {result.B.res.keygen.toFixed(2)} ms</div>
                    <div>Sign: {result.B.res.sign.toFixed(2)} ms</div>
                    <div>Verify: {result.B.res.verify.toFixed(2)} ms</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
