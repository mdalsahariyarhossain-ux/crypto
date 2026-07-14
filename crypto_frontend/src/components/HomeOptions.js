import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Tool cards data ───────────────────────────────────────────────────────────
const MAIN_TOOLS = [
  { path: "/key-generator",    icon: "🔑", tag: "RSA & ECC",  tagClass: "text-sky-400 bg-sky-500/10 border-sky-500/20",             title: "Key Generator",        cta: "Open →", accent: "hover:border-sky-400/40" },
  { path: "/text-encrypt ", icon: "🔒", tag: "Texts",      tagClass: "text-violet-400 bg-violet-500/10 border-violet-500/20",    title: "Text encryption",      cta: "Try →",  accent: "hover:border-violet-400/40" },
  { path: "/file-encrypt", icon: "📂", tag: "Files",      tagClass: "text-orange-400 bg-orange-500/10 border-orange-500/20",    title: "File Encryption",      cta: "Open →", accent: "hover:border-orange-400/40" },
  { path: "/AI-Advisor",       icon: "✨", tag: "AI-powered", tagClass: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20", title: "AI Algorithm Advisor", cta: "Ask →",  accent: "hover:border-fuchsia-400/40", featured: true },
  { path: "/Website-Analyzer", icon: "🌐", tag: "Real-world", tagClass: "text-green-400 bg-green-500/10 border-green-500/20",       title: "Website Analyzer",     cta: "Scan →", accent: "hover:border-green-400/40" },
];

const WIZARD_STEPS = [
  { id:1,  icon:"🛡️", label:"Select Key Size" },
  { id:2,  icon:"🔑", label:"Key Generation" },
  { id:3,  icon:"📂", label:"Upload File / Text" },
  { id:4,  icon:"🔒", label:"Encrypt File" },
  { id:5,  icon:"📊", label:"Sig + Verify Graph" },
  { id:6,  icon:"📊", label:"Encryption Bar Graph" },
  { id:7,  icon:"📈", label:"Encryption Chart" },
  { id:8,  icon:"🔓", label:"Decrypt File" },
  { id:9,  icon:"📊", label:"Decryption Bar Graph" },
  { id:10, icon:"📈", label:"Decryption Chart" },
  { id:11, icon:"✨", label:"Performance Summary" },
];

function ToolCard({ c }) {
  return (
    <Link
  to={c.path}
  onClick={(e) => {
    if (c.path === "/Wizard-Flow") {
      e.preventDefault();

      document.getElementById("quick-start")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }}
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

// ── Quick Start Card ──────────────────────────────────────────────────────────
function QuickStartCard() {
  const navigate = useNavigate();
  const [keyConfig, setKeyConfig] = useState("A");
  const [inputType, setInputType] = useState("text"); // "text" | "file"
  const [inputText, setInputText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputBuffer, setInputBuffer] = useState(null);
  const fileRef = useRef();

  function handleFile(f) {
    if (!f) return;
    setUploadedFile(f);
    setInputText("");
    const reader = new FileReader();
    reader.onload = () => setInputBuffer(reader.result);
    reader.readAsArrayBuffer(f);
  }

  function handleText(val) {
    setInputText(val);
    setUploadedFile(null);
    if (val.trim()) {
      setInputBuffer(new TextEncoder().encode(val).buffer);
    } else {
      setInputBuffer(null);
    }
  }

  function startWizard() {
  navigate("/Wizard-Flow", {
  state: {
    keyConfig,
    inputText,
    inputBuffer,
    uploadedFile: uploadedFile
      ? { name: uploadedFile.name, size: uploadedFile.size }
      : null
  }
});
}


  return (
    <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/80 border border-cyan-500/30 rounded-2xl p-5 shadow-xl shadow-cyan-500/5 overflow-hidden">
      {/* glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(56,189,248,0.06),_transparent_60%)]" />

      <div className="relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">⚡ Quick Start</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">11-Step Wizard</span>
            </div>
            <h2 className="text-base font-bold text-white">Start RSA vs ECC Comparison</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Choose key size, add your input, then launch the full comparison wizard</p>
          </div>
        </div>

        {/* Step 1: Key Size */}
        <div>
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2">Step 1 — Choose Key Size</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setKeyConfig("A")}
              className={`relative text-left p-3 rounded-xl border transition-all ${keyConfig === "A" ? "border-cyan-400 bg-slate-800/80 shadow-lg shadow-cyan-500/10" : "border-slate-700 bg-slate-900/60 hover:border-slate-600"}`}>
              {keyConfig === "A" && <span className="absolute top-2 right-2 text-[9px] font-black bg-cyan-400 text-slate-900 px-1.5 py-0.5 rounded">SELECTED</span>}
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">Option A — Standard</p>
              <p className="text-sm font-bold text-white">RSA-2048 ↔ ECC-P256</p>
              <p className="text-[10px] text-slate-400 mt-1">~112-bit security · Commonly used</p>
            </button>
            <button onClick={() => setKeyConfig("B")}
              className={`relative text-left p-3 rounded-xl border transition-all ${keyConfig === "B" ? "border-purple-400 bg-slate-800/80 shadow-lg shadow-purple-500/10" : "border-slate-700 bg-slate-900/60 hover:border-slate-600"}`}>
              {keyConfig === "B" && <span className="absolute top-2 right-2 text-[9px] font-black bg-purple-400 text-slate-900 px-1.5 py-0.5 rounded">SELECTED</span>}
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Option B — High Security</p>
              <p className="text-sm font-bold text-white">RSA-3072 ↔ ECC-P384</p>
              <p className="text-[10px] text-slate-400 mt-1">~128-bit security · NSA Suite B</p>
            </button>
          </div>
        </div>

        {/* Step 2: Input */}
        <div>
          <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2">Step 2 — Add Your Input</p>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setInputType("text")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${inputType === "text" ? "bg-cyan-500 border-transparent text-slate-900" : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"}`}>
              ✏️ Type Text
            </button>
            <button onClick={() => setInputType("file")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${inputType === "file" ? "bg-cyan-500 border-transparent text-slate-900" : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"}`}>
              📂 Upload File
            </button>
          </div>

          {inputType === "text" ? (
            <textarea rows={3} value={inputText} onChange={e => handleText(e.target.value)}
              placeholder="Type your message or text to encrypt..."
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:border-cyan-500/60 transition" />
          ) : (
            <div onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${uploadedFile ? "border-cyan-400 bg-cyan-950/10" : "border-slate-700 hover:border-cyan-400/50 hover:bg-slate-800/30"}`}>
              <input type="file" ref={fileRef} className="hidden" onChange={e => handleFile(e.target.files[0])} />
              {uploadedFile ? (
                <div>
                  <p className="text-sm font-semibold text-slate-200">✅ {uploadedFile.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{(uploadedFile.size/1024).toFixed(1)} KB · Click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-2xl mb-1">📂</p>
                  <p className="text-xs font-semibold text-slate-300">Drop a file or click to upload</p>
                  <p className="text-[10px] text-slate-500 mt-1">Any file type · Processed in-browser</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Launch button */}
        <button onClick={startWizard}
          className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-900 hover:from-cyan-400 hover:to-teal-400 transition-all active:scale-[0.99] shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2">
          🚀 Launch 9-Step Comparison Wizard
        </button>

        {/* Workflow preview */}
        <div>
          <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase mb-2">Workflow Preview</p>
          <div className="flex flex-wrap gap-1.5">
            {WIZARD_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1">
                <span className="text-[10px] bg-slate-800/80 border border-slate-700/60 text-slate-400 px-2 py-0.5 rounded-full">
                  {s.icon} {s.id}. {s.label}
                </span>
                {i < WIZARD_STEPS.length - 1 && <span className="text-slate-700 text-[10px]">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
export default function HomeOptions() {
  return (
    <div className="space-y-6">

      {/* Core tools */}
      <div>
        <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-2.5">🛠 Core tools</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {MAIN_TOOLS.map(c => <ToolCard key={c.title} c={c} />)}
        </div>
      </div>
      {/* Quick Start Card */}
      <div id="quick-start">
        <QuickStartCard />
      </div>
    </div>
  );
}