import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import HomeOptions from "./components/HomeOptions";
import AlgorithmUseCases from "./components/AlgorithmUseCases";
import SecurityChecklist from "./components/SecurityChecklist";
import AppSecureOptions from "./components/AppSecureOptions";
import AlgorithmComparison from "./components/AlgorithmComparison";
import KeyGeneratorPage from "./pages/KeyGeneratorPage";
import PerformanceChartPage from "./pages/PerformanceChartPage";
import ComparisonPage from "./pages/ComparisonPage";
import RsaEccBenchmarkPanel from "./components/RsaEccBenchmarkPanel";

function App() {
  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Header (darkMode removed from header props too) */}
        <Header />

        <Routes>
          {/* HOME PAGE */}
          <Route
            path="/"
            element={
              <>
                <HomeOptions />

                <main className="grid lg:grid-cols-2 gap-6">
                  <AlgorithmComparison />
                  <AlgorithmUseCases />
                </main>
              </>
            }
          />

          {/* INDIVIDUAL PAGES */}
          <Route path="/key-generator" element={<KeyGeneratorPage />} />
          <Route path="/graph" element={<PerformanceChartPage />} />
          <Route path="/comparison" element={<ComparisonPage />} />
          <Route path="/use-cases" element={<AlgorithmUseCases />} />
          <Route path="/security" element={<SecurityChecklist />} />
          <Route path="/app-secure" element={<AppSecureOptions />} />
          <Route path="/benchmark" element={<RsaEccBenchmarkPanel />} />
        </Routes>

        <footer className="text-xs text-center text-slate-400 mt-4">
          <p>CryptoVisualizer · RSA vs ECC</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
