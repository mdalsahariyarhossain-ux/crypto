import { useState } from "react";
import EncryptTab from "./EncryptTab";
import AIAdvisorTab from "./AIAdvisorTab";
import FileEncryptTab from "./FileEncryptTab";

const TABS = [
  { id: "encrypt", label: "🔒 Encrypt / Decrypt" },
  { id: "ai", label: "✨ AI Advisor" },
  { id: "file", label: "📂 File Encryption" },
];

export default function CryptoToolkit() {
  const [active, setActive] = useState("encrypt");
  return (
    <div className="max-w-7xl mx-auto rounded-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">Crypto Toolkit</h2>
        <p className="text-sm text-slate-400 mt-1">
          Real-world cryptography — encrypt messages, get AI recommendations, protect files
        </p>
      </div>
      <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/80 border border-slate-700 rounded-2xl shadow-xl shadow-slate-900/60 overflow-hidden">
        <div className="flex border-b border-slate-700 bg-slate-900/60">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActive(t.id)}
            className={`flex-1 py-3 px-2 text-sm font-semibold transition-all ${active===t.id?"text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/40":"text-slate-400 hover:text-slate-200 border-b-2 border-transparent"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {active==="encrypt" && <EncryptTab/>}
          {active==="ai" && <AIAdvisorTab/>}
          {active==="file" && <FileEncryptTab/>}
        </div>
      </div>
    </div>
  );
}
