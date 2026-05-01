import { useState } from "react";

export default function EncryptionDecryptionPage() {
  const [algorithm, setAlgorithm] = useState("RSA");
  const [results, setResults] = useState([]);
  const [liveResults, setLiveResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const RUNS = 30;
  const RSA_KEYS = [1024, 2048, 3072];
  const ECC_KEYS = ["P-256", "P-384"];

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runTest = async () => {
    setLoading(true);
    setResults([]);
    setLiveResults([]);

    const encoder = new TextEncoder();
    const message = encoder.encode("Crypto Visualizer");

    const keyList = algorithm === "RSA" ? RSA_KEYS : ECC_KEYS;

    let tempResults = keyList.map((key) => ({
      key: key.toString(),
      keyGen: 0,
      enc: 0,
      dec: 0,
      count: 0,
    }));

    for (let run = 0; run < RUNS; run++) {
      for (let i = 0; i < keyList.length; i++) {
        const key = keyList[i];
        let keyPair;

        // Key Generation Timing
        const keyStart = performance.now();

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
                name: "ECDH",
                namedCurve: key,
              },
              true,
              ["deriveKey"]
            );
          }

        const keyTime = performance.now() - keyStart;

        let encTime = 0;
        let decTime = 0;

        if (algorithm === "RSA") {
          const encStart = performance.now();

          const encrypted = await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            keyPair.publicKey,
            message
          );

          encTime = performance.now() - encStart;

          const decStart = performance.now();

          await crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            keyPair.privateKey,
            encrypted
          );

          decTime = performance.now() - decStart;
        } else {
  // Generate receiver key pair for ECDH
  const receiverKeys = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: key,
    },
    true,
    ["deriveKey"]
  );

  // Generate sender key pair
  const senderKeys = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: key,
    },
    true,
    ["deriveKey"]
  );

  // Encryption timing
  const encStart = performance.now();

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: receiverKeys.publicKey,
    },
    senderKeys.privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    message
  );

  encTime = performance.now() - encStart;

  // Decryption timing
  const decStart = performance.now();

  const receiverAESKey = await crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: senderKeys.publicKey,
    },
    receiverKeys.privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    receiverAESKey,
    encrypted
  );

  decTime = performance.now() - decStart;
}

        // Running Average Update
        const item = tempResults[i];
        item.count += 1;

        item.keyGen =
          (item.keyGen * (item.count - 1) + keyTime) / item.count;

        item.enc =
          (item.enc * (item.count - 1) + encTime) / item.count;

        item.dec =
          (item.dec * (item.count - 1) + decTime) / item.count;
      }

      // Live Results Update
      setLiveResults(
        tempResults.map((item) => ({
          key: item.key,
          keyGen: +item.keyGen.toFixed(2),
          enc: +item.enc.toFixed(2),
          dec: +item.dec.toFixed(2),
        }))
      );

      await sleep(20);
    }

    setResults(
      tempResults.map((item) => ({
        key: item.key,
        keyGen: +item.keyGen.toFixed(2),
        enc: +item.enc.toFixed(2),
        dec: +item.dec.toFixed(2),
      }))
    );

    setLoading(false);
  };

  const displayData = liveResults.length ? liveResults : results;

  return (
    <div className="grid lg:grid-cols-2 gap-6   ">
      {/* Control Panel */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-700">
        <h2 className="text-lg mb-4">Crypto Benchmark (30 Runs)</h2>

        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setAlgorithm("RSA")}
            className={`flex-1 py-2 rounded-xl ${
              algorithm === "RSA" ? "bg-sky-500" : "bg-slate-800"
            }`}
          >
            RSA
          </button>

          <button
            onClick={() => setAlgorithm("ECC")}
            className={`flex-1 py-2 rounded-xl ${
              algorithm === "ECC" ? "bg-green-500" : "bg-slate-800"
            }`}
          >
            ECC
          </button>
        </div>

        <button
          onClick={runTest}
          disabled={loading}
          className="w-full py-2 rounded bg-gradient-to-r from-sky-500 to-green-500"
        >
          {loading ? "Running..." : "Run Test"}
        </button>
      </div>

      {/* Results Panel */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-sm font-semibold text-slate-300 mb-6">
          Live Performance Graph
        </h2>

        {displayData.length > 0 ? (
          <div className="h-60 flex items-end justify-around px-6">
            {["keyGen", "enc", "dec"].map((operation) => {
              const max = Math.max(
                ...displayData.map((item) => item[operation]),
                0.001
              );

              return (
                <div
                  key={operation}
                  className="flex flex-col items-center flex-1"
                >
                  <div className="flex items-end gap-2 h-36">
                    {displayData.map((item, index) => (
                      <div
                        key={index}
                        className="w-8 bg-gradient-to-t from-sky-500 to-cyan-400 rounded-t-md"
                        style={{
                          height: `${(item[operation] / max) * 100}%`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="text-[11px] mt-2 text-slate-400">
                    {displayData
                      .map((item) => item[operation].toFixed(1))
                      .join(" | ")} ms
                  </div>

                  <div className="uppercase text-[10px] mt-1 text-slate-500">
                    {operation === "keyGen"
                      ? "Key Generation"
                      : operation === "enc"
                      ? "Encrypt"
                      : "Decrypt"}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center mt-20 text-slate-500">
            Run test to view graph
          </div>
        )}
        {/* RESULT TABLE (shows after benchmark complete) */}
{results.length > 0 && !loading && (
  <div className="mt-8 bg-slate-800/60 border border-slate-700 rounded-xl p-4">

    <h3 className="text-sm text-sky-300 mb-4 font-semibold">
      Compare Result (30-run Average)
    </h3>

    {/* Header */}
    <div className={`grid ${results.length === 3 ? "grid-cols-4" : "grid-cols-3"} text-xs text-slate-400 mb-2`}>
      <span>Metric</span>

      {results.map((r) => (
        <span
          key={r.key}
          className="text-center text-sky-400 font-semibold"
        >
          {algorithm}-{r.key}
        </span>
      ))}
    </div>

    {/* Key Generation */}
    <div className={`grid ${results.length === 3 ? "grid-cols-4" : "grid-cols-3"} py-2 border-t border-slate-700 text-xs`}>
      <span className="text-slate-300 font-medium">
        KeyGen
      </span>

      {results.map((r)=>(
        <span
          key={r.key}
          className="text-center"
        >
          {r.keyGen} ms
        </span>
      ))}
    </div>

    {/* Encrypt / Sign */}
    <div className={`grid ${results.length === 3 ? "grid-cols-4" : "grid-cols-3"} py-2 border-t border-slate-700 text-xs bg-slate-800/40`}>
      <span className="text-slate-300 font-medium">
        Encrypt
      </span>

      {results.map((r)=>(
        <span
          key={r.key}
          className="text-center"
        >
          {r.enc} ms
        </span>
      ))}
    </div>

    {/* Decrypt / Verify */}
    <div className={`grid ${results.length === 3 ? "grid-cols-4" : "grid-cols-3"} py-2 border-t border-slate-700 text-xs`}>
      <span className="text-slate-300 font-medium">
        Decrypt
      </span>

      {results.map((r)=>(
        <span
          key={r.key}
          className="text-center"
        >
          {r.dec} ms
        </span>
      ))}
    </div>

  </div>
)}
      </div>
    </div>
  );
}