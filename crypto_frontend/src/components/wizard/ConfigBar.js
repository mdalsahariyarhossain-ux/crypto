import React from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

export default function ConfigBar({
  rsaBits,
  eccCurve,
  uploadedFile,
  inputText
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800/70 p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
      <div className="pointer-events-none absolute -top-16 -left-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Shield className="w-5 h-5 text-cyan-400" />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
            Active Configuration
          </p>

          <p className="text-[13px] font-bold text-white truncate">
            RSA-{rsaBits}
            <span className="text-slate-600"> ↔ </span>
            ECC-{eccCurve}

            <span className="mx-2 text-slate-700">•</span>

            <span className="text-slate-300 font-medium">
              {uploadedFile
                ? `📂 ${uploadedFile.name}`
                : `✏️ ${inputText.length} chars of text`}
            </span>
          </p>
        </div>
      </div>

      <Link
        to="/"
        className="relative shrink-0 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 border border-slate-700 hover:border-cyan-500/40 rounded-lg px-3 py-1.5 transition-all"
      >
        ⚙️ Change Configuration
      </Link>
    </div>
  );
}