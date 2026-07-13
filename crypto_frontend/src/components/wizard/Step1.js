import React, { useState } from "react";
import { RefreshCw, FileText, Copy, Check } from "lucide-react";

function KeyBlock({ label, value, accent, copiedKey, keyId, onCopy }) {
  const isCopied = copiedKey === keyId;

  return (
    <div className="relative">
      <p className={`font-bold mb-2 ${accent}`}>{label}</p>
      <button
        onClick={() => onCopy(keyId, value)}
        className="absolute top-0 right-0 flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold border border-slate-700 bg-slate-800/60 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 transition-colors"
      >
        {isCopied ? (
          <>
            <Check className="w-3 h-3" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            Copy
          </>
        )}
      </button>
      <pre className="bg-slate-950 p-2 rounded break-all whitespace-pre-wrap">
        {value}
      </pre>
    </div>
  );
}

export default function Step1({
  rsaBits,
  eccCurve,
  keygenRunning,
  generateKeys,
  keys,
  showKeys,
  setShowKeys,
  keyTimes
}) {
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = async (keyId, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <p className="text-sm text-slate-400">
        Generate key pairs locally in your browser for the RSA-{rsaBits} ↔
        ECC-{eccCurve} configuration. This creates RSA-OAEP, RSA-PSS, ECDH
        and ECDSA key pairs.
      </p>

      <div className="flex gap-4">
        <button
          disabled={keygenRunning}
          onClick={generateKeys}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${keygenRunning ? "animate-spin" : ""}`}
          />
          {keygenRunning ? "Generating..." : "Generate RSA & ECC Keys"}
        </button>

        {keys && (
          <button
            onClick={() => setShowKeys(!showKeys)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-600 bg-slate-800/40 text-slate-200 hover:border-cyan-400"
          >
            <FileText className="w-4 h-4" />
            {showKeys ? "Hide Keys" : "Show Keys"}
          </button>
        )}
      </div>

      {keyTimes && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-cyan-400">
              {keyTimes.rsa.toFixed(2)} ms
            </p>
            <p className="text-[10px] uppercase text-slate-500">
              RSA Key Generation
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-emerald-400">
              {keyTimes.ecc.toFixed(2)} ms
            </p>
            <p className="text-[10px] uppercase text-slate-500">
              ECC Key Generation
            </p>
          </div>
        </div>
      )}

      {keys && showKeys && (
        <div className="grid grid-cols-2 gap-4">
          {/* RSA column - independent scroll */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin bg-slate-900 border border-slate-800 rounded-xl p-4 text-[10px] font-mono">
            <KeyBlock
              label="RSA Private Key"
              value={keys.rsaPEM.private}
              accent="text-cyan-300"
              copiedKey={copiedKey}
              keyId="rsa-private"
              onCopy={handleCopy}
            />
            <KeyBlock
              label="RSA Public Key"
              value={keys.rsaPEM.public}
              accent="text-cyan-300"
              copiedKey={copiedKey}
              keyId="rsa-public"
              onCopy={handleCopy}
            />
          </div>

          {/* ECC column - independent scroll */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin bg-slate-900 border border-slate-800 rounded-xl p-4 text-[10px] font-mono">
            <KeyBlock
              label="ECC Private Key"
              value={keys.eccPEM.private}
              accent="text-emerald-300"
              copiedKey={copiedKey}
              keyId="ecc-private"
              onCopy={handleCopy}
            />
            <KeyBlock
              label="ECC Public Key"
              value={keys.eccPEM.public}
              accent="text-emerald-300"
              copiedKey={copiedKey}
              keyId="ecc-public"
              onCopy={handleCopy}
            />
          </div>
        </div>
      )}
    </div>
  );
}