import React, {
  useState,
  useEffect,
  useCallback
} from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from "recharts";

// Example values
const RUNS = 5;

const RSA_KEYS = [
  1024,
  2048,
  3072,
  4096
];

const ECC_KEYS = [
  "P-256",
  "P-384",
  "P-521"
];

function PerformanceChartPage({ selectedAlgo }) {
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
    const message =
      encoder.encode("Crypto Benchmark Test");

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
        const item = tempResults[i];

        try {
          /* =========================
             KEY GENERATION
          ========================= */

          const keyStart = performance.now();

          let cryptoKeyPair;

          if (selectedAlgo === "RSA") {
            cryptoKeyPair =
              await crypto.subtle.generateKey(
                {
                  name: "RSA-OAEP",
                  modulusLength: currentKey,
                  publicExponent:
                    new Uint8Array([1, 0, 1]),
                  hash: "SHA-256"
                },
                true,
                ["encrypt", "decrypt"]
              );
          } else {
            cryptoKeyPair =
              await crypto.subtle.generateKey(
                {
                  name: "ECDH",
                  namedCurve: currentKey
                },
                true,
                ["deriveKey"]
              );
          }

          item.keyGen +=
            performance.now() - keyStart;

          /* =========================
             ENCRYPT / DECRYPT
          ========================= */

          if (selectedAlgo === "RSA") {
            const encStart = performance.now();

            const encryptedData =
              await crypto.subtle.encrypt(
                {
                  name: "RSA-OAEP"
                },
                cryptoKeyPair.publicKey,
                message
              );

            item.encrypt +=
              performance.now() - encStart;

            const decStart = performance.now();

            await crypto.subtle.decrypt(
              {
                name: "RSA-OAEP"
              },
              cryptoKeyPair.privateKey,
              encryptedData
            );

            item.decrypt +=
              performance.now() - decStart;
          } else {
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
                  public:
                    secondKeyPair.publicKey
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

            item.encrypt +=
              performance.now() - encStart;

            const decStart = performance.now();

            await crypto.subtle.decrypt(
              {
                name: "AES-GCM",
                iv
              },
              sharedKey,
              encryptedData
            );

            item.decrypt +=
              performance.now() - decStart;
          }

          /* =========================
             SIGN / VERIFY
          ========================= */

          let signKeyPair;

          if (selectedAlgo === "RSA") {
            signKeyPair =
              await crypto.subtle.generateKey(
                {
                  name: "RSA-PSS",
                  modulusLength: currentKey,
                  publicExponent:
                    new Uint8Array([1, 0, 1]),
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

          item.sign +=
            performance.now() - signStart;

          const verifyStart =
            performance.now();

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

          item.verify +=
            performance.now() - verifyStart;
        } catch (error) {
          console.error(
            "Benchmark Error:",
            error
          );
        }
      }
    }

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
    <div className="max-w-7xl mx-auto rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {selectedAlgo} Performance Analysis
          </h1>

          <p className="text-slate-400 mb-6">
            Average execution time from {RUNS} runs
          </p>
        </div>
      </div>

      <div className="bg-[#081b3a] rounded-2xl p-6 border border-slate-800">
        {loading ? (
          <div className="text-center py-20 text-lg">
            Running {selectedAlgo} benchmark...
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={500}
          >
            <LineChart data={graphData}>
              <CartesianGrid
                stroke="#334155"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="key"
                stroke="#94a3b8"
                label={{
                  value:
                    selectedAlgo === "RSA"
                      ? "RSA Key Size (bits)"
                      : "ECC Curves",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#94a3b8"
                }}
              />

              <YAxis
                yAxisId="left"
                stroke="#38bdf8"
                label={{
                  value:
                    "Key Generation Time (ms)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#38bdf8"
                }}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#22c55e"
                label={{
                  value:
                    "Operation Time (ms)",
                  angle: 90,
                  position: "insideRight",
                  fill: "#22c55e"
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border:
                    "1px solid #334155",
                  borderRadius: "12px"
                }}
              />

              <Legend />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="keyGen"
                stroke="#38bdf8"
                strokeWidth={4}
                name="Key Generation"
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="encrypt"
                stroke="#22c55e"
                strokeWidth={3}
                name="Encryption"
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="decrypt"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Decryption"
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sign"
                stroke="#ef4444"
                strokeWidth={3}
                name="Digital Signature"
              />

              <Line
                yAxisId="right"
                type="monotone"
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
  );
}

export default PerformanceChartPage;