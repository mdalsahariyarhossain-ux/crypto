import React, { useState } from "react";

const RUNS = 20;

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b) / arr.length : 0;
}

async function liveRSA(bits, onProgress) {
  const algo = {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: bits,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  };

  const data = new TextEncoder().encode("benchmark");
  let kg = [], sg = [], vf = [];
  let keyPair, lastSig;

  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    keyPair = await crypto.subtle.generateKey(algo, true, ["sign", "verify"]);
    kg.push(performance.now() - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    lastSig = await crypto.subtle.sign(algo.name, keyPair.privateKey, data);
    sg.push(performance.now() - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    await crypto.subtle.verify(algo.name, keyPair.publicKey, lastSig, data);
    vf.push(performance.now() - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  return { keygen: avg(kg), sign: avg(sg), verify: avg(vf) };
}

async function liveECC(curve, onProgress) {
  const algo = { name: "ECDSA", namedCurve: curve };
  const signParams = { name: "ECDSA", hash: "SHA-256" };
  const data = new TextEncoder().encode("benchmark");

  let kg = [], sg = [], vf = [];
  let keyPair, lastSig;

  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    keyPair = await crypto.subtle.generateKey(algo, true, ["sign", "verify"]);
    kg.push(performance.now() - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    lastSig = await crypto.subtle.sign(signParams, keyPair.privateKey, data);
    sg.push(performance.now() - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    await crypto.subtle.verify(signParams, keyPair.publicKey, lastSig, data);
    vf.push(performance.now() - t0);
    onProgress({ keygen: avg(kg), sign: avg(sg), verify: avg(vf) });
  }

  return { keygen: avg(kg), sign: avg(sg), verify: avg(vf) };
}

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

      const [outA, outB] = await Promise.all([
        A.algo === "RSA" ? liveRSA(A.bits, setProgressA) : liveECC(A.curve, setProgressA),
        B.algo === "RSA" ? liveRSA(B.bits, setProgressB) : liveECC(B.curve, setProgressB),
      ]);

      setResult({ mode: "compare", A: { cfg: A, res: outA }, B: { cfg: B, res: outB } });
    }

    setRunning(false);
  }

  const maxBar = Math.max(
    progressA.keygen, progressA.sign, progressA.verify,
    progressB.keygen, progressB.sign, progressB.verify, 0.0001
  );

  const barHeight = (v) => `${(v / maxBar) * 100}%`;

  return (
    <div className="grid lg:grid-cols-2 gap-6">

      {/* LEFT PANEL */}
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-4">

        <h2 className="text-sky-300 text-lg font-semibold">⚡ Crypto Run</h2>

        <div className="flex gap-3">
          <button
            onClick={() => setMode("single")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
              mode === "single" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            Single Test
          </button>
          <button
            onClick={() => setMode("compare")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
              mode === "compare" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            Compare
          </button>
        </div>

        {mode === "single" && (
          <div className="grid grid-cols-2 gap-2">
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                onClick={() => setSingleId(o.id)}
                className={`px-3 py-2 text-xs border rounded-2xl ${
                  o.id === singleId
                    ? "bg-sky-500 text-white border-sky-400"
                    : "bg-slate-800 text-slate-300 border-slate-600"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        {mode === "compare" && (
          <div className="space-y-3">
            <select
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 p-2 text-xs"
            >
              {OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>

            <select
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 p-2 text-xs"
            >
              {OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        <button
          disabled={running}
          onClick={runBenchmark}
          className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-2xl text-xs font-bold disabled:opacity-60"
        >
          {running ? "Running…" : "Run Benchmark"}
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl space-y-6">

        <h3 className="text-slate-300 text-sm font-semibold">
          Live Performance Graph
        </h3>

        <div className="h-52 flex items-end justify-between px-6">
          {["keygen", "sign", "verify"].map((op) => (
            <div key={op} className="flex flex-col items-center flex-1">
              <div className="flex items-end gap-2 h-32">
                <div
                  className="w-6 bg-sky-500 transition-all duration-200"
                  style={{ height: barHeight(progressA[op]) }}
                />
                {mode === "compare" && (
                  <div
                    className="w-6 bg-emerald-500 transition-all duration-200"
                    style={{ height: barHeight(progressB[op]) }}
                  />
                )}
              </div>

              <div className="text-[11px] text-slate-400 mt-1">
                {mode === "single"
                  ? `${progressA[op].toFixed(2)} ms`
                  : `A:${progressA[op].toFixed(2)} | B:${progressB[op].toFixed(2)} ms`}
              </div>

              <div className="uppercase text-[10px] text-slate-500 tracking-wide">
                {op}
              </div>
            </div>
          ))}
        </div>

        {result && (
          <div className="bg-slate-800 border border-slate-700 rounded-2x; p-4 text-[12px] space-y-3">
            {result.mode === "single" && (
              <>
                <b className="text-sky-400 ">{result.cfg.label}</b>
                <div>KeyGen: {result.res.keygen.toFixed(2)} ms</div>
                <div>Sign: {result.res.sign.toFixed(2)} ms</div>
                <div>Verify: {result.res.verify.toFixed(2)} ms</div>
              </>
            )}
        {result.mode === "compare" && (
          <div className="space-y-3">
            <div className="text-sky-400 font-semibold text-sm">
              Compare Result
            </div>

          <div className="grid grid-cols-3 text-[11px] border border-slate-700 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800 p-2 font-semibold"></div>
          <div className="bg-slate-800 text-l text-sky-500 p-2 font-bold text-center">
            {result.A.cfg.label}
          </div>
          <div className="bg-slate-800 text-l text-green-500 p-2 font-bold text-l text-center">
            {result.B.cfg.label}
          </div>

          {/* KeyGen */}
          <div className="bg-slate-800 font-bold text-l p-2">Key Generation</div>
          <div className="bg-slate-800 p-2 text-center">
            {result.A.res.keygen.toFixed(2)} ms
          </div>
          <div className="bg-slate-800 p-2 text-center">
            {result.B.res.keygen.toFixed(2)} ms
          </div>
          {/* Sign */}
          <div className="bg-slate-800 font-bold text-l  p-2">Sign</div>
          <div className="bg-slate-800 p-2 text-center">
            {result.A.res.sign.toFixed(2)} ms
          </div>
          <div className="bg-slate-800 p-2 text-center">
            {result.B.res.sign.toFixed(2)} ms
          </div>
          {/* Verify */}
          <div className="bg-slate-800 font-bold text-l  p-2">Verify</div>
          <div className="bg-slate-800  p-2 text-center">
           {result.A.res.verify.toFixed(2)} ms
          </div>
          <div className="bg-slate-800 p-2 text-center">
            {result.B.res.verify.toFixed(2)} ms
          </div>
          </div>
        </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
