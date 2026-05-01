import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

/* Constants outside component → fixes dependency warning */
const RSA_KEYS = [1024, 2048, 3072];
const ECC_KEYS = ["P-256", "P-384"];
const RUNS = 30;

export default function PerformanceChartPage() {
  const [selectedAlgo, setSelectedAlgo] = useState("RSA");
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);

  const runGraphBenchmark = useCallback(async () => {
    setLoading(true);
    setGraphData([]);

    const keyList =
      selectedAlgo === "RSA"
        ? RSA_KEYS
        : ECC_KEYS;

    const encoder = new TextEncoder();
    const message = encoder.encode("Crypto Benchmark Test");

    let tempResults = keyList.map((key) => ({
      key: key.toString(),
      keyGen: 0,
      encrypt: 0,
      decrypt: 0,
      sign: 0,
      verify: 0
    }));


    for (let run = 0; run < RUNS; run++) {
      for (let i = 0; i < keyList.length; i++) {
        const currentKey = keyList[i];
        let item = tempResults[i];

        try {
          /* =========================
             KEY GENERATION
          ========================== */
          const keyStart = performance.now();

          let cryptoKeyPair;

          if (selectedAlgo === "RSA") {
            cryptoKeyPair = await crypto.subtle.generateKey(
              {
                name: "RSA-OAEP",
                modulusLength: currentKey,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256"
              },
              true,
              ["encrypt", "decrypt"]
            );
          } else {
            cryptoKeyPair = await crypto.subtle.generateKey(
              {
                name: "ECDH",
                namedCurve: currentKey
              },
              true,
              ["deriveKey"]
            );
          }

          item.keyGen += performance.now() - keyStart;


          /* =========================
             ENCRYPT / DECRYPT
          ========================== */

          if (selectedAlgo === "RSA") {
            // RSA Encryption
            const encStart = performance.now();

            const encryptedData =
              await crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                cryptoKeyPair.publicKey,
                message
              );

            item.encrypt += performance.now() - encStart;


            // RSA Decryption
            const decStart = performance.now();

            await crypto.subtle.decrypt(
              { name: "RSA-OAEP" },
              cryptoKeyPair.privateKey,
              encryptedData
            );

            item.decrypt += performance.now() - decStart;
          }

          else {
            /* ECC Encryption using ECDH + AES */

            const secondKeyPair =
              await crypto.subtle.generateKey(
                {
                  name: "ECDH",
                  namedCurve: currentKey
                },
                true,
                ["deriveKey"]
              );

            const sharedKey =
              await crypto.subtle.deriveKey(
                {
                  name: "ECDH",
                  public: secondKeyPair.publicKey
                },
                cryptoKeyPair.privateKey,
                {
                  name: "AES-GCM",
                  length: 256
                },
                false,
                ["encrypt", "decrypt"]
              );

            const iv =
              crypto.getRandomValues(
                new Uint8Array(12)
              );

            // ECC Encryption
            const encStart = performance.now();

            const encryptedData =
              await crypto.subtle.encrypt(
                {
                  name: "AES-GCM",
                  iv
                },
                sharedKey,
                message
              );

            item.encrypt += performance.now() - encStart;


            // ECC Decryption
            const decStart = performance.now();

            await crypto.subtle.decrypt(
              {
                name: "AES-GCM",
                iv
              },
              sharedKey,
              encryptedData
            );

            item.decrypt += performance.now() - decStart;
          }


          /* =========================
             SIGN / VERIFY
          ========================== */

          let signKeyPair;

          if (selectedAlgo === "RSA") {
            signKeyPair =
              await crypto.subtle.generateKey(
                {
                  name: "RSA-PSS",
                  modulusLength: currentKey,
                  publicExponent: new Uint8Array([1, 0, 1]),
                  hash: "SHA-256"
                },
                true,
                ["sign", "verify"]
              );
          } else {
            signKeyPair =
              await crypto.subtle.generateKey(
                {
                  name: "ECDSA",
                  namedCurve: currentKey
                },
                true,
                ["sign", "verify"]
              );
          }


          // Signature
          const signStart = performance.now();

          const signature =
            await crypto.subtle.sign(
              selectedAlgo === "RSA"
                ? {
                    name: "RSA-PSS",
                    saltLength: 32
                  }
                : {
                    name: "ECDSA",
                    hash: "SHA-256"
                  },
              signKeyPair.privateKey,
              message
            );

          item.sign += performance.now() - signStart;


          // Verification
          const verifyStart = performance.now();

          await crypto.subtle.verify(
            selectedAlgo === "RSA"
              ? {
                  name: "RSA-PSS",
                  saltLength: 32
                }
              : {
                  name: "ECDSA",
                  hash: "SHA-256"
                },
            signKeyPair.publicKey,
            signature,
            message
          );

          item.verify += performance.now() - verifyStart;

        } catch (error) {
          console.error("Benchmark Error:", error);
        }
      }
    }


    /* =========================
       AVERAGE RESULTS
    ========================== */
    const finalResults =
      tempResults.map((item) => ({
        key: item.key,
        keyGen: +(item.keyGen / RUNS).toFixed(2),
        encrypt: +(item.encrypt / RUNS).toFixed(2),
        decrypt: +(item.decrypt / RUNS).toFixed(2),
        sign: +(item.sign / RUNS).toFixed(2),
        verify: +(item.verify / RUNS).toFixed(2)
      }));

    setGraphData(finalResults);
    setLoading(false);

  }, [selectedAlgo]);


  useEffect(() => {
    runGraphBenchmark();
  }, [runGraphBenchmark]);


  return (
    <div className="min-h-screen bg-[#06142d] text-white p-6">

      <div className="max-w-7xl mx-auto bg-slate-900/70 border border-slate-700 rounded-2xl p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">

          <div>
            <h1 className="text-3xl font-bold">
              {selectedAlgo} Performance Analysis
            </h1>

            <p className="text-slate-400 mt-2">
              Average execution time from {RUNS} benchmark runs
            </p>
          </div>

          {/* Toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedAlgo("RSA")}
              className={`px-5 py-2 rounded-xl ${
                selectedAlgo === "RSA"
                  ? "bg-sky-500"
                  : "bg-slate-800"
              }`}
            >
              RSA
            </button>

            <button
              onClick={() => setSelectedAlgo("ECC")}
              className={`px-5 py-2 rounded-xl ${
                selectedAlgo === "ECC"
                  ? "bg-green-500"
                  : "bg-slate-800"
              }`}
            >
              ECC
            </button>
          </div>
        </div>


        {/* Graph */}
        <div className="bg-[#081b3a] rounded-2xl p-6 border border-slate-800">

          {loading ? (
            <div className="text-center py-20 text-lg">
              Running {selectedAlgo} benchmark...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={graphData}>
                <CartesianGrid
                  stroke="#334155"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="key"
                  stroke="#94a3b8"
                />

                <YAxis
                  stroke="#94a3b8"
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #334155"
                  }}
                />

                <Legend />

                <Line
                  dataKey="keyGen"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  name="Key Generation"
                />

                <Line
                  dataKey="encrypt"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="Encryption"
                />

                <Line
                  dataKey="decrypt"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="Decryption"
                />

                <Line
                  dataKey="sign"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Digital Signature"
                />

                <Line
                  dataKey="verify"
                  stroke="#a855f7"
                  strokeWidth={3}
                  name="Signature Verification"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}