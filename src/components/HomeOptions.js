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
      title: "Rsa & Ecc Crypto run",
      emoji: "⚖️",
      description:
        "Check single test and both compare test with bar graph in timing basis.",
      cta: "Crypto Run"
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
      className="
        relative
        grid md:grid-cols-3 gap-5
        bg-gradient-to-br from-slate-800/70 to-slate-900/70
        border border-slate-700
        rounded-2xl
        p-5
        shadow-xl shadow-slate-900/50
        overflow-hidden
      "
    >
      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.08),_transparent_60%)]" />

      {options.map((opt) => (
        <Link
          key={opt.path}
          to={opt.path}
          className="
            relative group
            flex flex-col justify-between
            rounded-xl
            border border-slate-700
            bg-slate-900/80
            px-4 py-4
            transition-all duration-300
            hover:-translate-y-1
            hover:border-sky-400/70
            hover:shadow-lg hover:shadow-sky-500/10
          "
        >
          {/* top accent line */}
          <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/40 to-transparent opacity-0 group-hover:opacity-100 transition" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">{opt.emoji}</div>
              <h2 className="text-sm font-semibold tracking-tight">
                {opt.title}
              </h2>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-400">
              {opt.description}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[11px] font-medium text-sky-300 group-hover:text-sky-400 transition">
              {opt.cta}
            </span>
            <span className="text-sky-400/60 group-hover:translate-x-1 transition-transform">
              →
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export default HomeOptions;
