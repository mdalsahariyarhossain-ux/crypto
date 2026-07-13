import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import WizardFlowPage from "./pages/WizardFlowPage";
import KeyGeneratorPage from "./pages/KeyGeneratorPage";
import EncryptionDecryptionPage from "./pages/EncryptionDecryptionPage";
import ToolkitPage from "./pages/ToolkitPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import HomeOptions from "./components/HomeOptions";
import AlgorithmComparison from "./components/AlgorithmComparison";
import AlgorithmUseCases from "./components/AlgorithmUseCases";
import WebsiteAnalyzerPage from "./pages/WebsiteAnalyzerPage";
import AIAdvisorPage from "./pages/AIAdvisorPage";
import TextEncryptPage from "./pages/TextEncryptPage";
import FileEncryptPage from "./pages/FileEncryptPage";



function App() {
  return (
  
      <div className="bg-slate-900 text-slate-100 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Header */}
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
          <Route path="/graph" element={<AnalyticsDashboard />} />
          <Route path="/Wizard-Flow" element={<WizardFlowPage />} />
          <Route path="/use-cases" element={<AlgorithmUseCases />} />
          <Route path="/Encryption-Decryption" element={<EncryptionDecryptionPage />} />
          <Route path="/Toolkit" element={<ToolkitPage />} />
          <Route path="/Website-Analyzer" element={<WebsiteAnalyzerPage />} />
          <Route path="/AI-Advisor" element={<AIAdvisorPage />} />
          <Route path="/text-encrypt" element={<TextEncryptPage />} />
          <Route path="/file-encrypt" element={<FileEncryptPage />} />
        </Routes>

          <footer className="text-xs text-center text-slate-400 mt-4">
            <p>CryptoVisualizer · RSA vs ECC</p>
          </footer>
        </div>
      </div>
    
  );
}

export default App;


