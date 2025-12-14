import React, { useState } from "react";

const rsaOptions = [2048, 3072, 4096];
const eccCurves = ["P-256", "P-384", "P-521"];

async function generateRSA(modulusLength) {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  );
  const privateKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey
  );

  return { publicKeyJwk, privateKeyJwk };
}

async function generateECC(namedCurve) {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve
    },
    true,
    ["deriveKey", "deriveBits"]
  );

  const publicKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey
  );
  const privateKeyJwk = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey
  );

  return { publicKeyJwk, privateKeyJwk };
}

function KeyGenerationPanel() {
  const [algo, setAlgo] = useState("RSA");
  const [rsaBits, setRsaBits] = useState(2048);
  const [eccCurve, setEccCurve] = useState("P-256");
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setError("");
    setKeys(null);

    if (!window.crypto || !window.crypto.subtle) {
      setError("Web Crypto API not available in this browser.");
      return;
    }

    try {
      setLoading(true);
      let result;
      if (algo === "RSA") {
        result = await generateRSA(rsaBits);
      } else {
        result = await generateECC(eccCurve);
      }
      setKeys(result);
    } catch (e) {
      console.error(e);
      setError("Key generation failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch (err) {
      console.error(err);
      alert("Copy failed");
    }
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 shadow-lg shadow-slate-900/40">
      <h2 className="text-sm font-semibold mb-1">Interactive Key Generator</h2>
      <p className="text-[11px] text-slate-400 mb-3">
        Generate RSA or ECC key<strong>locally in your browser</strong> using the
        Web Crypto API.
      </p>

      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setAlgo("RSA")}
          className={`px-3 py-1 text-xs rounded-full border transition ${
            algo === "RSA"
              ? "bg-sky-500 text-white border-sky-400"
              : "bg-slate-900 border-slate-600 text-slate-300"
          }`}
        >
          RSA
        </button>
        <button
          onClick={() => setAlgo("ECC")}
          className={`px-3 py-1 text-xs rounded-full border transition ${
            algo === "ECC"
              ? "bg-emerald-500 text-white border-emerald-400"
              : "bg-slate-900 border-slate-600 text-slate-300"
          }`}
        >
          ECC
        </button>
      </div>

      {algo === "RSA" ? (
        <div className="mb-3">
          <label className="block text-[11px] mb-1 text-slate-300">
            RSA modulus length (bits)
          </label>
          <div className="flex gap-2 flex-wrap">
            {rsaOptions.map((bits) => (
              <button
                key={bits}
                onClick={() => setRsaBits(bits)}
                className={`px-2 py-1 text-[11px] rounded-full border transition ${
                  rsaBits === bits
                    ? "bg-sky-500 text-white border-sky-400"
                    : "bg-slate-900 border-slate-600 text-slate-300"
                }`}
              >
                {bits}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <label className="block text-[11px] mb-1 text-slate-300">
            ECC curve
          </label>
          <div className="flex gap-2 flex-wrap">
            {eccCurves.map((curve) => (
              <button
                key={curve}
                onClick={() => setEccCurve(curve)}
                className={`px-2 py-1 text-[11px] rounded-full border transition ${
                  eccCurve === curve
                    ? "bg-emerald-500 text-white border-emerald-400"
                    : "bg-slate-900 border-slate-600 text-slate-300"
                }`}
              >
                {curve}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-1 w-full text-xs font-semibold py-2 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 border border-sky-300 shadow hover:shadow-lg disabled:opacity-60"
      >
        {loading ? "Generating..." : `Generate ${algo} key`}
      </button>

      {error && (
        <p className="mt-2 text-[11px] text-red-400 bg-red-950/40 border border-red-700/40 rounded-lg p-2">
          {error}
        </p>
      )}

      {keys && (
        <div className="mt-3 space-y-2 max-h-64 overflow-auto text-[10px] bg-slate-900/80 border border-slate-700 rounded-xl p-2 scrollbar-thin">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">
                Public key (JWK)
              </span>
              <button
                className="text-[10px] px-2 py-0.5 rounded-full border border-slate-600 hover:border-sky-400"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(keys.publicKeyJwk, null, 2)
                  )
                }
              >
                Copy
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all text-slate-300">
              {JSON.stringify(keys.publicKeyJwk, null, 2)}
            </pre>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1 mt-2">
              <span className="font-semibold text-slate-200">
                Private key (JWK)
              </span>
              <button
                className="text-[10px] px-2 py-0.5 rounded-full border border-slate-600 hover:border-emerald-400"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(keys.privateKeyJwk, null, 2)
                  )
                }
              >
                Copy
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all text-slate-300">
              {JSON.stringify(keys.privateKeyJwk, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <p className="mt-2 text-[10px] text-slate-400">
        Keys are generated in memory and shown here. For real systems, you’d need secure
        storage, rotation, and a full security review.
      </p>
    </div>
  );
}

export default KeyGenerationPanel;
