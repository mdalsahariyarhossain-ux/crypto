// src/components/HomeOptions.js
import React from "react";
import { Link } from "react-router-dom";

function HomeOptions() {
  const options = [
    {
      path: "/key-generator",
      title: "Key Generator (RSA & ECC)",
      emoji: "🔑",
      description:
        "Generate RSA and ECC key pairs in your browser using the Web Crypto API.",
      cta: "Open key generator"
    },
    {
      path: "/benchmark",
      title: "Rsa & Ecc Runtime",
      emoji: "⚖️",
      description:
        "Check single test and both compare test with bar graph in timing basis.",
      cta: "Run Benchmarks"
    },
    {
      path: "/graph",
      title: "Performance Charts",
      emoji: "📈",
      description:
        "Analyze security level and key sizes to estimate cryptographic strength.",
      cta: "Open graphs"
    }
  ];

  return (
    <section
      id="home-options"
      className="grid md:grid-cols-3 gap-4 bg-slate-800/60 border border-slate-700 rounded-2xl p-4 shadow-lg shadow-slate-900/40"
    >
      {options.map((opt) => (
        <Link
          key={opt.path}
          to={opt.path}
          className="group flex flex-col justify-between bg-slate-900/70 border border-slate-700 rounded-xl px-3 py-3 hover:border-sky-400 hover:bg-slate-900 transition"
        >
          <div>
            <div className="text-2xl mb-1">{opt.emoji}</div>
            <h2 className="text-sm font-semibold mb-1">{opt.title}</h2>
            <p className="text-[11px] text-slate-400">{opt.description}</p>
          </div>
          <div className="mt-3 text-[11px] font-medium text-sky-300 group-hover:text-sky-400">
            {opt.cta} →
          </div>
        </Link>
      ))}
    </section>
  );
}

export default HomeOptions;
