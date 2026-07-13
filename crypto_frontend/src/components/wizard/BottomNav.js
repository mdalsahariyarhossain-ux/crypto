import React from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export default function BottomNav({
  activeStep,
  totalSteps,
  status,
  isStepCompleted,
  setActiveStep,
  onReset
}) {
  return (
    <div className="relative z-10 border-t border-slate-800 pt-4 mt-6 flex justify-between items-center">
      <button
        disabled={activeStep === 1}
        onClick={() => setActiveStep(activeStep - 1)}
        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      {status && (
        <span className="text-[10px] font-medium text-slate-500 text-center max-w-sm truncate hidden md:inline">
          {status}
        </span>
      )}

      {activeStep < totalSteps ? (
        <button
          disabled={!isStepCompleted(activeStep)}
          onClick={() => setActiveStep(activeStep + 1)}
          className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl border transition-all bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-950 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl border transition-all bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white hover:from-purple-400 hover:to-pink-400"
        >
          Reset Session
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}