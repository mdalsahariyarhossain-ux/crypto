import React, { useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* LEFT — Logo + Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col justify-center gap-1.5 p-2 border border-slate-600 rounded-lg hover:border-sky-400 transition"
          >
            <span className="w-5 h-0.5 bg-white"></span>
            <span className="w-5 h-0.5 bg-white"></span>
            <span className="w-5 h-0.5 bg-white"></span>
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              CryptoVisualizer
            </h1>
            <p className="text-sm text-slate-400">
              RSA vs ECC · Benchmarks · Security Tools
            </p>
          </div>
        </div>
      </header>

      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={closeMenu}
        />
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 bg-slate-900 border-r border-slate-700 shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <p className="text-sm font-semibold text-slate-100">Navigation</p>
          <button
            onClick={closeMenu}
            className="p-2 border border-slate-600 rounded-lg text-xs"
          >
            ✕
          </button>
        </div>

        {/* Drawer Links */}
        <div className="px-4 py-3 text-sm space-y-3">
          <ul className="space-y-2">

            <li><Link to="/" onClick={closeMenu}>🏠 Home</Link></li>
            <li><Link to="/comparison" onClick={closeMenu}>⚖️ RSA vs ECC</Link></li>
            <li><Link to="/key-generator" onClick={closeMenu}>🔑 Key Generator</Link></li>
            <li><Link to="/security" onClick={closeMenu}>✅ Security Checklist</Link></li>
            <li><Link to="/app-secure" onClick={closeMenu}>🛡️ App Secure Mapping</Link></li>
            <li><Link to="/Graph" onClick={closeMenu}>📊 Performance Charts</Link></li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default Header;
