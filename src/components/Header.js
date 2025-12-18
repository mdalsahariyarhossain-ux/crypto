import React, { useState } from "react";

function Header() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* HEADER */}
      <header
        className="
          relative
          flex flex-col sm:flex-row sm:items-center justify-between gap-4
          bg-gradient-to-br from-slate-900/90 to-slate-800/80
          border border-slate-700
          rounded-2xl
          px-4 py-3
          shadow-xl shadow-slate-900/60
          overflow-hidden
        "
      >
        <div className="relative z-10 flex items-center gap-3">
          {/* MENU BUTTON */}
          <button
            onClick={() => setOpen(true)}
            className="
              group
              flex flex-col justify-center gap-1.5
              p-2.5
              border border-slate-600
              rounded-xl
              bg-slate-900/60
              hover:border-sky-400
              hover:bg-slate-900
              hover:scale-105
              active:scale-95
              transition-all
            "
          >
            <span className="w-5 h-0.5 bg-white group-hover:bg-sky-400 transition"></span>
            <span className="w-5 h-0.5 bg-white group-hover:bg-sky-400 transition"></span>
            <span className="w-5 h-0.5 bg-white group-hover:bg-sky-400 transition"></span>
          </button>

          {/* LOGO */}
          <a
            href="/"
            onClick={closeMenu}
            className="
              group
              flex flex-col
              cursor-pointer
              transition
              hover:-translate-y-0.5
            "
          >
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight group-hover:text-sky-400 transition">
              CryptoVisualizer
            </h1>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition">
              RSA & ECC · Compare · Security Tools
            </p>
          </a>
        </div>
      </header>

      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* DRAWER */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50
          bg-gradient-to-b from-slate-900 to-slate-950
          border-r border-slate-700
          shadow-2xl shadow-black/60
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Drawer Header */}
        <div className="relative px-4 py-4 border-b border-slate-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_70%)]" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-100 tracking-wide">
              Navigation
            </p>
            <button
              onClick={closeMenu}
              className="
                px-2 py-1
                border border-slate-600
                rounded-lg
                text-xs
                hover:border-sky-400
                hover:text-sky-400
                hover:scale-105
                transition
              "
            >
              ✕
            </button>
          </div>
        </div>

        {/* Drawer Links */}
        <div className="px-4 py-4 text-sm">
          <ul className="space-y-1">
            {[
              ["🏠", "/", "Home"],
              ["🔑", "/key-generator", "Key Generator"],
              ["⚖️", "/benchmark", "RSA & ECC Runtime"],
              ["📈", "/Graph", "Performance Charts"],
            ].map(([icon, path, label]) => (
              <li key={path}>
                <a
                  href={path}
                  onClick={closeMenu}
                  className="
                    group
                    flex items-center
                    gap-3
                    rounded-lg
                    px-3 py-2
                    border border-transparent
                    hover:border-sky-400/40
                    hover:bg-slate-800/60
                    hover:-translate-y-0.5
                    transition-all
                  "
                >
                  <span className="text-base">{icon}</span>
                  <span className="text-[13px] text-slate-300 group-hover:text-sky-400 transition">
                    {label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Header;
