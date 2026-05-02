import React, { useState } from "react";
import PerformanceChartPage from "./PerformanceChartPage";
import WorkloadAnalysisPage from "./WorkloadAnalysisPage";

export default function AnalyticsDashboard() {
  const [selectedGraph, setSelectedGraph] = useState("performance");
  const [selectedAlgo, setSelectedAlgo] = useState("RSA");

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-3 mb-2 flex justify-between items-center flex-wrap gap-4">
        
        {/* Left Title */}
        <div>
          <h1 className="text-3xl font-semibold text-cyan-300">
            Crypto Analytics Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Monitor encryption performance and workload analysis
          </p>
        </div>

        {/* Right Side Buttons in One Line */}
        <div className="flex items-center gap-6">
          
          {/* Graph Selection */}
          <div className="flex bg-slate-800/60 rounded-2xl p-2 gap-2">
            <button
              onClick={() => setSelectedGraph("performance")}
              className={`px-5 py-2 rounded-xl transition-all ${
                selectedGraph === "performance"
                  ? "bg-cyan-400 text-black font-semibold"
                  : "text-white"
              }`}
            >
              Performance Chart
            </button>

            <button
              onClick={() => setSelectedGraph("workload")}
              className={`px-5 py-2 rounded-xl transition-all ${
                selectedGraph === "workload"
                  ? "bg-cyan-400 text-black font-semibold"
                  : "text-white"
              }`}
            >
              Workload Analysis
            </button>
          </div>

          {/* Algorithm Selection */}
          <div className="flex bg-slate-800/60 rounded-2xl p-2 gap-2">
            <button
              onClick={() => setSelectedAlgo("RSA")}
              className={`px-5 py-2 rounded-xl transition-all ${
                selectedAlgo === "RSA"
                  ? "bg-purple-400 text-black font-semibold"
                  : "text-white"
              }`}
            >
              RSA
            </button>

            <button
              onClick={() => setSelectedAlgo("ECC")}
              className={`px-5 py-2 rounded-xl transition-all ${
                selectedAlgo === "ECC"
                  ? "bg-purple-400 text-black font-semibold"
                  : "text-white"
              }`}
            >
              ECC
            </button>
          </div>
        </div>
      </div>

      {/* Full Graph Section */}
      <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-h-[600px]">
        {selectedGraph === "performance" ? (
          <PerformanceChartPage selectedAlgo={selectedAlgo} />
        ) : (
          <WorkloadAnalysisPage selectedAlgo={selectedAlgo} />
        )}
      </div>
    </div>
  );
}
