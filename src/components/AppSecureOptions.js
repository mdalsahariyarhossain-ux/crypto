// src/components/AppSecureOptions.js
import React, { useState } from "react";

const MODES = [
  {
    id: "chat",
    label: "Secure Chat App",
    tagline: "ECC keeps your chat safe",
    summary:
      "Modern end-to-end encrypted chat apps rely heavily on elliptic-curve cryptography.",
    details: [
      "ECC (e.g. Curve25519 / P-256) for key exchange between devices.",
      "Symmetric encryption (e.g. AES-GCM or ChaCha20-Poly1305) for message contents.",
      "Forward secrecy: new keys are derived as conversations continue.",
      "Authentication via signatures so you know which device sent which message."
    ],
    note: "If your chat app uses modern ECC key exchange + strong symmetric ciphers, that’s a very good sign."
  },
  {
    id: "login",
    label: "Login / Web App",
    tagline: "RSA helps protect your login",
    summary:
      "Your username & password are usually protected inside an HTTPS connection.",
    details: [
      "TLS handshake: server proves its identity using an RSA or ECC certificate.",
      "Key exchange (RSA, ECDHE, or both) sets up a secret session key.",
      "Your login data then travels inside this encrypted tunnel.",
      "Server stores password hashes (e.g. bcrypt/Argon2), not raw passwords."
    ],
    note: "If your site strictly uses HTTPS (no HTTP) and modern TLS settings, RSA/ECC are doing a lot of work to protect logins."
  },
  {
    id: "payments",
    label: "Payment / Wallet App",
    tagline: "ECC makes payments faster",
    summary:
      "Payments and digital wallets lean on ECC for fast signatures and small keys.",
    details: [
      "ECC (e.g. secp256k1, P-256) for signing transactions or authorizing payments.",
      "Transport encryption (HTTPS) again uses RSA/ECC for secure API calls.",
      "Symmetric encryption for card data or stored tokens.",
      "Small keys and fast operations are important for mobile and high-frequency transactions."
    ],
    note: "Fast, small ECC keys give a nice performance boost when you’re doing a lot of transactions or working on mobile devices."
  }
];

function AppSecureOptions() {
  const [mode, setMode] = useState("chat");

  const active = MODES.find((m) => m.id === mode);

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 shadow-lg shadow-slate-900/40">
      <h2 className="text-sm font-semibold mb-1">
        App secure? – Real-world crypto mapping
      </h2>
      <p className="text-[11px] text-slate-400 mb-3">
        Pick an app type to see how RSA and ECC are typically used in the real world.
      </p>

      {/* Mode buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={
              "px-3 py-1 rounded-full text-[11px] border transition " +
              (mode === m.id
                ? "bg-sky-500 text-white border-sky-400"
                : "bg-slate-900 border-slate-600 text-slate-200")
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Details panel */}
      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-3 text-[11px]">
        <p className="text-xs font-semibold mb-1">
          {active.tagline}
        </p>
        <p className="text-slate-300 mb-2">
          {active.summary}
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-300">
          {active.details.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
        <p className="mt-2 text-[10px] text-slate-400">
          {active.note}
        </p>
      </div>

      <p className="mt-2 text-[10px] text-slate-500">
        This panel explains common patterns. Your browser app (this CryptoVisualizer)
        does not connect to real services like WhatsApp or banks – it just shows how
        the algorithms are used conceptually.
      </p>
    </div>
  );
}

export default AppSecureOptions;
