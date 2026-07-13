export function StatCard({ label, value }) {
  return (
    <div className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3">
      <div className="text-lg font-bold text-cyan-400">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
      {children}
    </p>
  );
}

export function OutputBox({ children, mono }) {
  return (
    <div className={`
      bg-slate-900/80 border border-slate-700 rounded-xl p-3
      text-sm text-slate-300 break-all min-h-[70px] max-h-[160px]
      overflow-y-auto leading-relaxed whitespace-pre-wrap
      ${mono ? "font-mono text-[11px]" : ""}
    `}>
      {children}
    </div>
  );
}

export function Btn({ onClick, primary, disabled, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
        border transition-all active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed
        ${primary
          ? "bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-900 hover:from-cyan-400 hover:to-teal-400"
          : "bg-slate-800/60 border-slate-600 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-400"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

