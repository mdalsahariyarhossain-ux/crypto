// src/components/AlgorithmUseCases.js
import React from "react";

function AlgorithmUseCases() {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-900/40 space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Real-World Use Cases: RSA & ECC</h2>
        <p className="text-xs text-slate-400">
          Not just theory — this is how modern cryptography actually protects systems you use every day.
        </p>
      </div>

      {/* PRIMARY USE CASES */}
      <div className="grid md:grid-cols-3 gap-3">
        {/* Secure chat */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wide text-emerald-300 mb-1">Secure chat</div>
          <h3 className="text-sm font-semibold mb-1">ECC keeps your chats private</h3>
          <ul className="text-[11px] text-slate-300 space-y-1">
            <li>• Messaging apps use ECC-based key exchange.</li>
            <li>• Each conversation has unique keys (forward secrecy).</li>
            <li>• Messages are encrypted using fast symmetric crypto (AES-GCM).</li>
          </ul>
          <p className="mt-2 text-[10px] text-slate-400">
            ECC’s small keys make it perfect for phones and millions of concurrent sessions.
          </p>
        </div>

        {/* Web security */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wide text-sky-300 mb-1">Web & logins</div>
          <h3 className="text-sm font-semibold mb-1">RSA & ECC secure the web</h3>
          <ul className="text-[11px] text-slate-300 space-y-1">
            <li>• HTTPS relies on RSA or ECC certificates.</li>
            <li>• Servers prove identity using public-key crypto.</li>
            <li>• Session keys are negotiated, then symmetric encryption takes over.</li>
          </ul>
          <p className="mt-2 text-[10px] text-slate-400">
            ECC is increasingly preferred due to faster TLS handshakes.
          </p>
        </div>

        {/* Payments */}
        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-3">
          <div className="text-[10px] uppercase tracking-wide text-fuchsia-300 mb-1">Payments</div>
          <h3 className="text-sm font-semibold mb-1">ECC powers digital payments</h3>
          <ul className="text-[11px] text-slate-300 space-y-1">
            <li>• Digital wallets sign transactions with ECC.</li>
            <li>• Blockchains rely heavily on ECC signatures.</li>
            <li>• Mobile payments benefit from low computation cost.</li>
          </ul>
          <p className="mt-2 text-[10px] text-slate-400">
            ECC enables secure, fast, and scalable transaction systems.
          </p>
        </div>
      </div>

      {/* SECONDARY USE CASES */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-2">🔐 Software & updates</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Operating systems, browsers, and mobile apps verify updates using RSA or ECC
            signatures. This ensures updates come from a trusted source and haven’t been
            tampered with.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-200 mb-2">🆔 Identity & authentication</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Smart cards, hardware security keys (YubiKey), and government IDs use public-key
            cryptography to authenticate users without sharing secrets.
          </p>
        </div>
      </div>

      {/* SUMMARY STRIP */}
      <div className="rounded-xl border border-slate-700 bg-gradient-to-r from-slate-900/70 to-slate-800/70 p-4">
        <p className="text-[11px] text-slate-300 leading-relaxed">
          <strong className="text-slate-200">Big picture:</strong> RSA and ECC are rarely used to
          encrypt large data directly. Instead, they establish trust, exchange keys, and
          verify identities — while fast symmetric algorithms (like AES) protect the actual
          data.
        </p>
      </div>

      <p className="text-[10px] text-slate-500">
        In modern systems, the winning formula is clear: <strong>ECC for efficiency</strong>,
        <strong> RSA for compatibility</strong>, and <strong>symmetric crypto for speed</strong>.
      </p>
    </div>
  );
}

export default AlgorithmUseCases;
