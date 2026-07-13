import { useState } from "react";

export default function WebsiteAnalyzer() {
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function analyze() {
    if (!website.trim()) {
      setError("Please enter a website.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("https://crypto-z0td.onrender.com/api/certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host: website,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ||  "Please enter a valid website.");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Backend connection failed.");
    }

    setLoading(false);
  }

return (
        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700 rounded-2xl p-4 shadow-xl shadow-slate-900/60 overflow-hidden">
    {/* Background Glow */}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_65%)]" />


      {/* Header */}
      <div className="relative mb-5">
        <h2 className="text-sm font-semibold tracking-wide">
          🌐 Website Certificate Analyzer
        </h2>

        <p className="text-[11px] text-slate-400 mt-1">
          Analyze a live website and discover whether it uses
          <span className="text-cyan-400 font-medium"> RSA </span>
          or
          <span className="text-emerald-400 font-medium"> ECC </span>
          along with its TLS certificate details.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-3">

        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="Example: google.com"
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400 transition"
        />

        <button
          onClick={analyze}
          disabled={loading}
            className="w-fit px-6 py-2.5 rounded-3xl text-sm font-semibold bg-gradient-to-r from-sky-500 to-emerald-500 border border-sky-300/30 hover:shadow-lg transition disabled:opacity-60"        >
          {loading ? "Analyzing..." : "🔍 Analyze Website"}
        </button>

      </div>

      {/* Error */}

      {error && (

        <div className="mt-4 rounded-xl border border-red-600/40 bg-red-900/20 p-3 text-red-300 text-xs">

          {error}

        </div>

      )}

      {/* Result */}

      {result && (

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          <InfoCard title="🌐 Website" value={result.website} />

          <InfoCard title="🔐 Algorithm" value={result.algorithm} />

          <InfoCard title="🔑 Key Size" value={result.keySize} />

          <InfoCard title="✅ Status" value={result.status} />

          <InfoCard title="🏢 Issuer" value={result.issuer} />

          <InfoCard title="👤 Subject" value={result.subject} />

          <InfoCard title="📅 Valid From" value={result.validFrom} />

          <InfoCard title="⏳ Expires" value={result.validTo} />

          <div className="md:col-span-2">

            <InfoCard
              title="🔍 SHA-256 Fingerprint"
              value={result.fingerprint}
            />

          </div>

        </div>

      )}
  </div>
);
}

function InfoCard({ title, value }) {
  return (
    <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-4 hover:border-cyan-400/40 transition">

      <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">
        {title}
      </div>

      <div className="text-sm font-semibold text-slate-100 break-all leading-relaxed">
        {value || "-"}
      </div>

    </div>
  );
}