import React from "react";
import { Link } from "react-router-dom";


const MAIN_TOOLS = [
  { path: "/key-generator",        icon: "🔑", tag: "RSA & ECC",    tagClass: "text-sky-400 bg-sky-500/10 border-sky-500/20",    title: "Key Generator",                  cta: "Open →", accent: "hover:border-sky-400/40" },
  { path: "/benchmark",            icon: "⚖️", tag: "Benchmark",    tagClass: "text-amber-400 bg-amber-500/10 border-amber-500/20", title: "RSA & ECC Runtime",              cta: "Run →",  accent: "hover:border-amber-400/40" },
  { path: "/Graph",                icon: "📈", tag: "Performance",  tagClass: "text-teal-400 bg-teal-500/10 border-teal-500/20",   title: "Performance Charts",             cta: "View →", accent: "hover:border-teal-400/40" },
  { path: "/encryption-Decryption",icon: "🛡️", tag: "30 Runs",     tagClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",   title: "Encryption & Decryption Runtime",cta: "Test →", accent: "hover:border-rose-400/40" },
  { path: "/Website-Analyzer",     icon: "🌐", tag: "Real-world",   tagClass: "text-green-400 bg-green-500/10 border-green-500/20",title: "Website Analyzer",               cta: "Scan →", accent: "hover:border-green-400/40" },
];

const TOOLKIT = [
  { path: "/Toolkit?tab=encrypt", icon: "🔒", tag: "Encrypt",    tagClass: "text-violet-400 bg-violet-500/10 border-violet-500/20",   title: "Encrypt & Decrypt",    cta: "Try →",  accent: "hover:border-violet-400/40" },
  { path: "/Toolkit?tab=ai",      icon: "✨", tag: "AI-powered", tagClass: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20", title: "AI Algorithm Advisor", cta: "Ask →",  accent: "hover:border-fuchsia-400/40", featured: true },
  { path: "/Toolkit?tab=file",    icon: "📂", tag: "Files",      tagClass: "text-orange-400 bg-orange-500/10 border-orange-500/20",   title: "File Encryption",      cta: "Open →", accent: "hover:border-orange-400/40" },
];

const COMPARE = [
  { label: "Basis",    rsa: "Prime factorization", ecc: "Elliptic curve" },
  { label: "Key size", rsa: "2048 – 4096 bit",     ecc: "224 – 384 bit" },
  { label: "Speed",    rsa: "Slower",               ecc: "Much faster" },
  { label: "Power",    rsa: "High",                 ecc: "Low" },
  { label: "Best for", rsa: "Legacy / TLS",         ecc: "Mobile / IoT" },
];

function Card({ c }) {
  return (
    <Link to={c.path}
      className={`relative group flex flex-col justify-between gap-4 bg-slate-900/70 border border-slate-700/70 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${c.accent} ${c.featured ? "border-fuchsia-500/30" : ""}`}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition rounded-t-xl" />
      <div className="flex items-center justify-between">
        <span className="text-2xl">{c.icon}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${c.tagClass}`}>{c.tag}</span>
      </div>
      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        <span className="text-[13px] font-semibold text-white">{c.title}</span>
        <span className="text-xs text-sky-400 group-hover:translate-x-0.5 transition-transform">{c.cta}</span>
      </div>
    </Link>
  );
}

export default function HomeOptions() {
  return (
    <div className="space-y-6">

      {/* Hero — compact */}
      <div className="relative text-center py-8 px-4 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/90 to-slate-800/60 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.07),_transparent_60%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-full px-3 py-1 mb-3">
            🔐 Cryptography toolkit
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">CryptoVisualizer</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Compare RSA & ECC, generate keys, benchmark performance, encrypt files and get AI recommendations — all in your browser.
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            {[["RSA & ECC","Algorithms"],["8 Tools","Available"],["AI","Advisor"],["100%","Client-side"]].map(([v,l])=>(
              <div key={l} className="text-center">
                <div className="text-base font-bold text-white">{v}</div>
                <div className="text-[11px] text-slate-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    
    

      {/* Core tools */}
      <div>
        <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-2.5">🛠 Core tools</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {MAIN_TOOLS.map(c => <Card key={c.title} c={c} />)}
        </div>
      </div>

      {/* Toolkit features */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">✨ Crypto toolkit</p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">AI-powered</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {TOOLKIT.map(c => <Card key={c.title} c={c} />)}
        </div>
      </div>

      {/* Compare table */}
      <div className="bg-slate-900/60 border border-slate-700/70 rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 text-[11px] font-semibold px-4 py-2.5 border-b border-slate-800 bg-slate-800/40">
          <span className="text-slate-500 uppercase tracking-wider">Feature</span>
          <span className="text-sky-400 text-center uppercase tracking-wider">RSA</span>
          <span className="text-teal-400 text-center uppercase tracking-wider">ECC</span>
        </div>
        {COMPARE.map((r, i) => (
          <div key={r.label} className={`grid grid-cols-3 px-4 py-2.5 text-xs border-b border-slate-800/50 last:border-0 ${i%2===0?"bg-slate-800/10":""}`}>
            <span className="text-slate-500">{r.label}</span>
            <span className="text-slate-300 text-center">{r.rsa}</span>
            <span className="text-teal-300 text-center">{r.ecc}</span>
          </div>
        ))}
      </div>

    </div>
  );
}