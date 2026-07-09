import React, { useEffect, useState, useCallback } from "react";
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

const WORKLOADS = [10, 50, 100];

export default function WorkloadAnalysisPage({ selectedAlgo }) {
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(true);
  const runWorkloadBenchmark = useCallback(async () => {
    setLoading(true);

    const encoder = new TextEncoder();
    const message = encoder.encode("Crypto Workload Test");

    let results = [];

    for (let workload of WORKLOADS) {
      try {
        let keyGenTotal = 0;
        let encryptTotal = 0;
        let decryptTotal = 0;
        let signTotal = 0;
        let verifyTotal = 0;

        for (let i = 0; i < workload; i++) {

          /* RSA WORKLOAD */
          if (selectedAlgo === "RSA") {
            const keyStart = performance.now();

            const keyPair =
              await crypto.subtle.generateKey(
                {
                  name: "RSA-OAEP",
                  modulusLength: 2048,
                  publicExponent: new Uint8Array([1, 0, 1]),
                  hash: "SHA-256"
                },
                true,
                ["encrypt", "decrypt"]
              );

            keyGenTotal += performance.now() - keyStart;

            // encryption
            const encStart = performance.now();

            const encrypted =
              await crypto.subtle.encrypt(
                { name: "RSA-OAEP" },
                keyPair.publicKey,
                message
              );

            encryptTotal += performance.now() - encStart;

            // decryption
            const decStart = performance.now();

            await crypto.subtle.decrypt(
              { name: "RSA-OAEP" },
              keyPair.privateKey,
              encrypted
            );

            decryptTotal += performance.now() - decStart;
          }

          /* ECC WORKLOAD */
          else {
            const keyStart = performance.now();

            const keyPair =
              await crypto.subtle.generateKey(
                {
                  name: "ECDSA",
                  namedCurve: "P-256"
                },
                true,
                ["sign", "verify"]
              );

            keyGenTotal += performance.now() - keyStart;

            // sign
            const signStart = performance.now();

            const signature =
              await crypto.subtle.sign(
                {
                  name: "ECDSA",
                  hash: "SHA-256"
                },
                keyPair.privateKey,
                message
              );

            signTotal += performance.now() - signStart;

            // verify
            const verifyStart = performance.now();

            await crypto.subtle.verify(
              {
                name: "ECDSA",
                hash: "SHA-256"
              },
              keyPair.publicKey,
              signature,
              message
            );

            verifyTotal += performance.now() - verifyStart;
          }
        }

        if (selectedAlgo === "RSA") {
          results.push({
            workload: `${workload} Runs`,
            keyGen: +(keyGenTotal / workload).toFixed(2),
            encrypt: +(encryptTotal / workload).toFixed(2),
            decrypt: +(decryptTotal / workload).toFixed(2)
          });
        } else {
          results.push({
            workload: `${workload} Runs`,
            keyGen: +(keyGenTotal / workload).toFixed(2),
            sign: +(signTotal / workload).toFixed(2),
            verify: +(verifyTotal / workload).toFixed(2)
          });
        }

      } catch (error) {
        console.error(error);
      }
    }

    setGraphData(results);
    setLoading(false);
  }, [selectedAlgo]);

  useEffect(() => {
  runWorkloadBenchmark();
}, [runWorkloadBenchmark]);


  return (
    <div className="max-w-7xl mx-auto rounded-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">

          <div>
      <h2 className="text-2xl font-bold mb-2">
        {selectedAlgo} Workload Analysis
      </h2>

      <p className="text-slate-400 mb-6">
        Performance under increasing workload
      </p>
      </div>
      </div>

      <div className="
        bg-[#081b3a]
        rounded-2xl
        p-6
      ">
        {loading ? (
          <div className="text-center py-20">
            Running workload benchmark...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={graphData}>
              <CartesianGrid
                stroke="#334155"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="workload"
                stroke="#94a3b8"
              />

              <YAxis
                stroke="#94a3b8"
                label={{
                  value: "Execution Time (ms)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#94a3b8"
                }}
              />

              <Tooltip />
              <Legend />

              {/* Common */}
              <Line
                dataKey="keyGen"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Key Generation"
              />

              {/* RSA */}
              {selectedAlgo === "RSA" && (
                <>
                  <Line
                    dataKey="encrypt"
                    stroke="#f97316"
                    strokeWidth={3}
                    name="Encryption"
                  />

                  <Line
                    dataKey="decrypt"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name="Decryption"
                  />
                </>
              )}

              {/* ECC */}
              {selectedAlgo === "ECC" && (
                <>
                  <Line
                    dataKey="sign"
                    stroke="#f97316"
                    strokeWidth={3}
                    name="Digital Signature"
                  />

                  <Line
                    dataKey="verify"
                    stroke="#22c55e"
                    strokeWidth={3}
                    name="Signature Verification"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}