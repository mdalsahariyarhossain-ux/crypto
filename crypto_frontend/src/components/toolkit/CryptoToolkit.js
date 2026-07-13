import { useState } from "react";
import { useLocation } from "react-router-dom";
import TextEncryptTab from "./TextEncryptTab";
import FileEncryptTab from "./FileEncryptTab";

const TABS = [
  { id: "Text", label: "🔒 Text Encryption" },
  { id: "file", label: "📂 File Encryption" },
];

export default function CryptoToolkit() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const initialTab = TABS.some(t => t.id === params.get("tab"))
    ? params.get("tab")
    : "Text";

  const [active, setActive] = useState(initialTab);

  return (
    <div className="max-w-7xl mx-auto rounded-2xl">

      {/* HEADER */}
      <header
        className="
          relative
          flex flex-col sm:flex-row sm:items-center justify-between gap-4
          bg-gradient-to-br from-slate-900/90 to-slate-800/80
          border border-slate-700
          rounded-2xl
          px-6 py-4
          shadow-xl shadow-slate-900/60
          overflow-hidden
          mb-6
        "
      >
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Crypto Toolkit
          </h2>

          <p className="mt-1 text-slate-400">
            Real-world cryptography — encrypt messages, get AI recommendations,
            and protect files.
          </p>
        </div>
      </header>

      {/* MAIN CARD */}
      <div
        className="
          bg-gradient-to-br from-slate-900/90 to-slate-800/80
          border border-slate-700
          rounded-2xl
          shadow-xl shadow-slate-900/60
          overflow-hidden
        "
      >
        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/60">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`
                flex-1
                py-3
                px-4
                text-sm
                font-semibold
                transition-all
                border-b-2
                ${
                  active === tab.id
                    ? "border-cyan-400 text-cyan-400 bg-slate-800/50"
                    : "border-transparent text-slate-400 hover:text-white"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {active === "Text" && <TextEncryptTab />}
          {active === "file" && <FileEncryptTab />}
        </div>
      </div>
    </div>
  );
}