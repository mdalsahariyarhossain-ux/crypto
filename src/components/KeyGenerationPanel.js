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

  return {
    publicKeyJwk: await crypto.subtle.exportKey("jwk", keyPair.publicKey),
    privateKeyJwk: await crypto.subtle.exportKey("jwk", keyPair.privateKey)
  };
}

async function generateECC(namedCurve) {
  const keyPair = await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve },
    true,
    ["deriveKey", "deriveBits"]
  );

  return {
    publicKeyJwk: await crypto.subtle.exportKey("jwk", keyPair.publicKey),
    privateKeyJwk: await crypto.subtle.exportKey("jwk", keyPair.privateKey)
  };
}

function KeyGenerationPanel() {
  const [algo, setAlgo] = useState("RSA");
  const [rsaBits, setRsaBits] = useState(2048);
  const [eccCurve, setEccCurve] = useState("P-256");
  const [loading, setLoading] = useState(false);
  const [keys, setKeys] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);

  const handleGenerate = async () => {
    setError("");
    setKeys(null);

    if (!window.crypto?.subtle) {
      setError("Web Crypto API not available in this browser.");
      return;
    }

    try {
      setLoading(true);
      const result =
        algo === "RSA"
          ? await generateRSA(rsaBits)
          : await generateECC(eccCurve);
      setKeys(result);
    } catch (e) {
      console.error(e);
      setError("Key generation failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-2xl p-5 shadow-xl shadow-slate-900/60 overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_65%)]" />

      {/* header */}
      <div className="relative mb-4">
        <h2 className="text-sm font-semibold tracking-wide">
          Key Generator
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Generate RSA or ECC keys <strong>locally</strong> using the Web Crypto
          API.
        </p>
      </div>

      {/* algorithm switch */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setAlgo("RSA")}
          className={`px-4 py-1.5 text-[11px] rounded-full border transition-all ${
            algo === "RSA"
              ? "bg-sky-500/90 text-white border-sky-400 shadow shadow-sky-500/30"
              : "bg-slate-900 border-slate-600 text-slate-300"
          }`}
        >
          RSA
        </button>
        <button
          onClick={() => setAlgo("ECC")}
          className={`px-4 py-1.5 text-[11px] rounded-full border transition-all ${
            algo === "ECC"
              ? "bg-emerald-500/90 text-white border-emerald-400 shadow shadow-emerald-500/30"
              : "bg-slate-900 border-slate-600 text-slate-300"
          }`}
        >
          ECC
        </button>
      </div>

      {/* options */}
      {algo === "RSA" ? (
        <div className="mb-4">
          <label className="block text-[11px] mb-1 text-slate-300">
            RSA modulus length (bits)
          </label>
          <div className="flex gap-2 flex-wrap">
            {rsaOptions.map((bits) => (
              <button
                key={bits}
                onClick={() => setRsaBits(bits)}
                className={`px-3 py-1 text-[11px] rounded-full border transition-all ${
                  rsaBits === bits
                    ? "bg-sky-500/90 text-white border-sky-400 shadow shadow-sky-500/30"
                    : "bg-slate-900 border-slate-600 text-slate-300"
                }`}
              >
                {bits}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block text-[11px] mb-1 text-slate-300">
            ECC curve
          </label>
          <div className="flex gap-2 flex-wrap">
            {eccCurves.map((curve) => (
              <button
                key={curve}
                onClick={() => setEccCurve(curve)}
                className={`px-3 py-1 text-[11px] rounded-full border transition-all ${
                  eccCurve === curve
                    ? "bg-emerald-500/90 text-white border-emerald-400 shadow shadow-emerald-500/30"
                    : "bg-slate-900 border-slate-600 text-slate-300"
                }`}
              >
                {curve}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-2 w-full text-xs font-semibold py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 border border-sky-300/40 shadow-lg hover:shadow-xl transition disabled:opacity-60"
      >
        {loading ? "Generating..." : `Generate ${algo} key`}
      </button>

      {/* error */}
      {error && (
        <p className="mt-3 text-[11px] text-red-400 bg-red-950/40 border border-red-700/40 rounded-xl p-2">
          {error}
        </p>
      )}

      {/* keys */}
      {keys && (
        <div className="mt-4 space-y-3 max-h-72 overflow-auto text-[10px] bg-slate-900/80 border border-slate-700 rounded-xl p-3 scrollbar-thin">
          {/* public key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">
                Public key (JWK)
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(keys.publicKeyJwk, null, 2),
                    "public"
                  )
                }
                className="text-[10px] px-2 py-0.5 rounded-full border border-slate-600 hover:border-sky-400 transition"
              >
                {copied === "public" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all text-slate-300 leading-relaxed">
              {JSON.stringify(keys.publicKeyJwk, null, 2)}
            </pre>
          </div>

          {/* private key */}
          <div>
            <div className="flex items-center justify-between mb-1 mt-2">
              <span className="font-semibold text-slate-200">
                Private key (JWK)
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(keys.privateKeyJwk, null, 2),
                    "private"
                  )
                }
                className="text-[10px] px-2 py-0.5 rounded-full border border-slate-600 hover:border-emerald-400 transition"
              >
                {copied === "private" ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all text-slate-300 leading-relaxed">
              {JSON.stringify(keys.privateKeyJwk, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default KeyGenerationPanel;
