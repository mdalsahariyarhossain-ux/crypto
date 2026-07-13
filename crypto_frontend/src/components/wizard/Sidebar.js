import React from "react";
import { CheckCircle } from "lucide-react";

export default function Sidebar({
  STEPS,
  activeStep,
  setActiveStep,
  isStepCompleted,
  isStepAccessible,
  getStepStatusClass
}) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="lg:col-span-1 bg-gradient-to-br from-slate-900/90 to-slate-800/80 border border-slate-800/80 rounded-2xl p-4 sticky top-6 shadow-2xl backdrop-blur-md hidden lg:block animate-fadeIn">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">
          Flow Progress
        </h3>

        <div className="space-y-1">
          {STEPS.map((s) => {
            const IconComponent = s.icon;
            const isCompleted = isStepCompleted(s.id);
            const isActive = activeStep === s.id;

            return (
              <button
                key={s.id}
                disabled={!isStepAccessible(s.id)}
                onClick={() => setActiveStep(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${getStepStatusClass(
                  s.id
                )}`}
              >
                <div
                  className={`p-1.5 rounded-lg border ${
                    isActive
                      ? "bg-slate-900/40 border-cyan-300"
                      : isCompleted
                      ? "bg-emerald-950/20 border-emerald-400"
                      : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold truncate">
                    {s.id}. {s.label}
                  </p>

                  <p className="text-[9px] text-slate-400">
                    {isActive
                      ? "In Progress"
                      : isCompleted
                      ? "Completed"
                      : "Locked"}
                  </p>
                </div>

                {isCompleted && !isActive && (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper */}
      <div className="lg:hidden bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex overflow-x-auto gap-2 scrollbar-thin">
        {STEPS.map((s) => {
          const isCompleted = isStepCompleted(s.id);
          const isActive = activeStep === s.id;

          return (
            <button
              key={s.id}
              disabled={!isStepAccessible(s.id)}
              onClick={() => setActiveStep(s.id)}
              className={`flex-none flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
                isActive
                  ? "bg-cyan-500 text-slate-900 border-cyan-400 font-semibold"
                  : isCompleted
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : isStepAccessible(s.id)
                  ? "bg-slate-800/80 text-slate-300 border-slate-700/60"
                  : "bg-slate-900/40 text-slate-600 border-slate-800/80"
              }`}
            >
              <span>{s.id}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}