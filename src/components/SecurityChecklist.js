import React from "react";

const items = [
  {
    label: "Keys generated in browser (Web Crypto API)",
    status: "ok",
    note: "Good for demos; no keys sent to server in this UI."
  },
  {
    label: "No authentication / user accounts",
    status: "risk",
    note: "Anyone can use the page; fine for demo, not for private messaging."
  },
  {
    label: "No backend, no secure storage",
    status: "risk",
    note: "Keys vanish on refresh; nothing is encrypted at rest."
  },
  {
    label: "Transport security (HTTPS) not configured here",
    status: "risk",
    note: "You must host this over HTTPS yourself."
  },
  {
    label: "Educational purpose only",
    status: "ok",
    note: "Designed for learning, not real-world protection."
  }
];

const pillStyles = {
  ok: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  risk: "bg-amber-500/10 text-amber-300 border-amber-500/40"
};

const labelPrefix = {
  ok: "OK",
  risk: "RISK"
};

function SecurityChecklist() {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 shadow-lg shadow-slate-900/40">
      <h2 className="text-sm font-semibold mb-1">Is this app secure?</h2>
      <p className="text-[11px] text-slate-400 mb-3">
        Short answer: it&apos;s a <strong>learning tool</strong>. Not reviewed or
        hardened like a real security product.
      </p>
      <ul className="space-y-2 text-[11px]">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="bg-slate-900/70 border border-slate-700 rounded-xl p-2"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-slate-200">
                {item.label}
              </span>
              <span
                className={
                  "px-2 py-0.5 rounded-full border text-[10px] uppercase " +
                  pillStyles[item.status]
                }
              >
                {labelPrefix[item.status]}
              </span>
            </div>
            <p className="text-slate-400">{item.note}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-slate-500">
        For a real secure system, you&apos;d need: threat modeling, backend
        validation, secure storage, audits, monitoring, and probably a security
        expert.
      </p>
    </div>
  );
}

export default SecurityChecklist;
