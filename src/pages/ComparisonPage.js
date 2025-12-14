import React from "react";
import RsaEccBenchmarkPanel from "../components/RsaEccBenchmarkPanel";
// plus whatever else you already import

function ComparisonPage() {
  return (
    <div className="space-y-6">
      {/* ...your existing comparison UI (app name, RSA vs ECC text, etc.)... */}

      {/* 🔥 NEW: Live benchmark section */}
      <RsaEccBenchmarkPanel />
    </div>
  );
}

export default ComparisonPage;
