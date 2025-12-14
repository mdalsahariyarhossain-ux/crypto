// src/components/AlgorithmUseCases.js
import React from "react";

function AlgorithmUseCases() {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-900/40">
      <h2 className="text-lg font-semibold mb-1">
        Real-World Use Cases: RSA & ECC
      </h2>
      <p className="text-xs text-slate-400 mb-4">
        Not just a demo: this is how RSA and ECC are actually used in real systems.
      </p>

      <div className="grid md:grid-cols-3 gap-3">
        {/* Chat security */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wide text-emerald-300 mb-1">
            Secure chat
          </div>
          <h3 className="text-sm font-semibold mb-1">
            ECC keeps your chats safe
          </h3>
          <ul className="text-[11px] text-slate-300 space-y-1">
            <li>• Modern messengers use ECC-style key exchange.</li>
            <li>• Each chat gets its own secret key (forward secrecy).</li>
            <li>• Actual messages are encrypted with fast symmetric ciphers (e.g. AES-GCM), key negotiated via ECC.</li>
          </ul>
          <p className="mt-2 text-[10px] text-slate-400">
            Idea: ECC = small, fast keys → great for phones and many secure chat sessions.
          </p>
        </div>

        {/* Login / website security */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wide text-sky-300 mb-1">
            Logins & websites
          </div>
          <h3 className="text-sm font-semibold mb-1">
            RSA protects your login
          </h3>
          <ul className="text-[11px] text-slate-300 space-y-1">
            <li>• When you see <code>https://</code>, the server often proves its identity with an RSA or ECC certificate.</li>
            <li>• Your browser uses RSA/ECC to agree on a secret session key.</li>
            <li>• Your username/password are then sent inside that encrypted tunnel.</li>
          </ul>
          <p className="mt-2 text-[10px] text-slate-400">
            RSA is still very common in TLS certificates, with ECC increasingly used for
            faster handshakes.
          </p>
        </div>

        {/* Payments / blockchain / mobile */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wide text-fuchsia-300 mb-1">
            Payments & transactions
          </div>
          <h3 className="text-sm font-semibold mb-1">
            ECC makes payments faster
          </h3>
          <ul className="text-[11px] text-slate-300 space-y-1">
            <li>• Many digital wallets and blockchains use ECC signatures.</li>
            <li>• Small keys & fast operations → ideal for mobile and high volume.</li>
            <li>• Payment APIs again run over HTTPS (RSA or ECC) for transport security.</li>
          </ul>
          <p className="mt-2 text-[10px] text-slate-400">
            Encryption in payments is often a combo: ECC for keys & signatures + symmetric crypto for the actual data.
          </p>
        </div>
      </div>

      <p className="mt-4 text-[10px] text-slate-500">
        This is a simplified view, but the pattern is real:{" "}
        <strong>RSA/ECC for identity + key exchange</strong>,{" "}
        <strong>symmetric ciphers (AES)</strong> for the actual data.
      </p>
    </div>
  );
}

export default AlgorithmUseCases;
