import { useState } from "react";

export default function EncryptionDecryptionPage() {
  const [algorithm, setAlgorithm] = useState("RSA");
  const [results, setResults] = useState([]);
  const [liveResults, setLiveResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const RUNS = 30;

  const RSA_KEYS = [1024, 2048, 3072];
  const ECC_KEYS = ["P-256", "P-384"];

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const runTest = async () => {
    setLoading(true);
    setResults([]);
    setLiveResults([]);

    const encoder = new TextEncoder();
    const message = encoder.encode("Crypto Visualizer");

    const keyList = algorithm === "RSA" ? RSA_KEYS : ECC_KEYS;

    let temp = keyList.map((k) => ({
      key: k.toString(),
      keyGen: 0,
      enc: 0,
      dec: 0,
      count: 0,
    }));

    for (let i = 0; i < RUNS; i++) {
      for (let idx = 0; idx < keyList.length; idx++) {
        let key = keyList[idx];
        let keyPair;

        const start = performance.now();

        if (algorithm === "RSA") {
          keyPair = await crypto.subtle.generateKey(
            {
              name: "RSA-OAEP",
              modulusLength: key,
              publicExponent: new Uint8Array([1, 0, 1]),
              hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
          );
        } else {
          keyPair = await crypto.subtle.generateKey(
            {
              name: "ECDSA",
              namedCurve: key,
            },
            true,
            ["sign", "verify"]
          );
        }

        const keyTime = performance.now() - start;

        let encTime = 0;
        let decTime = 0;

        if (algorithm === "RSA") {
          const encStart = performance.now();
          const cipher = await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            keyPair.publicKey,
            message
          );
          encTime = performance.now() - encStart;

          const decStart = performance.now();
          await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            keyPair.privateKey,
            cipher
          );
          decTime = performance.now() - decStart;
        } else {
          const signStart = performance.now();
          const signature = await crypto.subtle.sign(
            { name: "ECDSA", hash: "SHA-256" },
            keyPair.privateKey,
            message
          );
          encTime = performance.now() - signStart;

          const verifyStart = performance.now();
          await crypto.subtle.verify(
            { name: "ECDSA", hash: "SHA-256" },
            keyPair.publicKey,
            signature,
            message
          );
          decTime = performance.now() - verifyStart;
        }

        let item = temp[idx];

        item.count++;
        item.keyGen = (item.keyGen * (item.count - 1) + keyTime) / item.count;
        item.enc = (item.enc * (item.count - 1) + encTime) / item.count;
        item.dec = (item.dec * (item.count - 1) + decTime) / item.count;
      }

      // 🔥 LIVE GRAPH UPDATE
      setLiveResults(
        temp.map((r) => ({
          key: r.key,
          keyGen: +r.keyGen.toFixed(2),
          enc: +r.enc.toFixed(2),
          dec: +r.dec.toFixed(2),
        }))
      );

      await sleep(20);
    }

    // FINAL RESULT
    setResults(
      temp.map((r) => ({
        key: r.key,
        keyGen: +r.keyGen.toFixed(2),
        enc: +r.enc.toFixed(2),
        dec: +r.dec.toFixed(2),
      }))
    );

    setLoading(false);
  };

  const displayData = liveResults.length ? liveResults : results;

  return (
    <div className="grid lg:grid-cols-2 gap-6">

      {/* LEFT PANEL */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6">

        <h2 className="text-lg mb-4">⚡ Crypto Run</h2>

        {/* ALGORITHM */}
        <div className="flex gap-3 mb-4">
        <button
          onClick={() => setAlgorithm("RSA")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
            algorithm === "RSA"
              ? "bg-sky-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          RSA
        </button>

        <button
          onClick={() => setAlgorithm("ECC")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
            algorithm === "ECC"
              ? "bg-green-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          ECC
        </button>
      </div>

        {/* RUN */}
        <button
          onClick={runTest}
          className="w-full py-2 rounded bg-gradient-to-r from-sky-500 to-green-500"
        >
          {loading ? "Running..." : "Run"}
        </button>
      </div>

      {/* RIGHT PANEL */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 space-y-6">

        <h2 className="text-sm font-semibold text-slate-300">
          Live Performance Graph
        </h2>

        {displayData.length > 0 ? (
          <div className="h-60 flex items-end justify-around px-6">
            {["keyGen", "enc", "dec"].map((op) => {
              const max = Math.max(...displayData.map(r => r[op]), 0.001);

              return (
                <div key={op} className="flex flex-col items-center flex-1">
                  <div className="flex items-end gap-2 h-36">
                    {displayData.map((r, i) => (
                      <div
                        key={i}
                        className="w-8 bg-gradient-to-t from-sky-500 to-cyan-400 rounded-t-md shadow-md shadow-sky-500/20 transition-all duration-300"
                        style={{
                          height: `${(r[op] / max) * 100}%`
                        }}
                      />
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-2 text-center">
                    {displayData.map((r) => r[op].toFixed(1)).join(" | ")} ms
                  </div>

                  <div className="uppercase text-[10px] text-slate-500 mt-1">
                    {op === "keyGen"
                      ? "KeyGen"
                      : op === "enc"
                      ? (algorithm === "RSA" ? "Encrypt" : "Sign")
                      : (algorithm === "RSA" ? "Decrypt" : "Verify")}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-slate-500 mt-20 text-sm">
            Run test to see graph
          </div>
        )}

        {/* TABLE */}
        {results.length > 0 && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">

            <h3 className="text-sm text-sky-400 mb-3 font-semibold">
              Compare Result
            </h3>

            <div className="grid grid-cols-4 text-xs text-slate-400 mb-2">
              <span>Metric</span>
              {results.map((r, i) => (
                <span key={i} className="text-center text-sky-400 font-semibold">
                  {algorithm}-{r.key}
                </span>
              ))}
            </div>

            {["keyGen", "enc", "dec"].map((metric, i) => (
              <div
                key={i}
                className={`grid grid-cols-4 py-2 border-t border-slate-700 text-xs ${
                  i === 1 ? "bg-slate-800/40" : ""
                }`}
              >
                <span className="text-slate-300 font-medium">
                  {metric === "keyGen"
                    ? "KeyGen"
                    : metric === "enc"
                    ? (algorithm === "RSA" ? "Encrypt" : "Sign")
                    : (algorithm === "RSA" ? "Decrypt" : "Verify")}
                </span>

                {results.map((r, j) => (
                  <span key={j} className="text-center">
                    {r[metric]} ms
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}