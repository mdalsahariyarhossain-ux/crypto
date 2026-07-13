import FileEncryptTab from "../components/toolkit/FileEncryptTab";

export default function FileEncryptPage() {
  return (
    <div className="max-w-7xl mx-auto rounded-2xl">

      {/* HEADER */}
      <header
        className="
          relative
          flex flex-col sm:flex-row sm:items-center justify-between gap-4
          bg-gradient-to-br from-slate-900/90 to-slate-800/80
          border border-slate-700
          rounded-2xl
          px-6 py-4
          shadow-xl shadow-slate-900/60
          overflow-hidden
          mb-6
        "
      >
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            📂 File Encryption
          </h2>

          <p className="mt-1 text-slate-400">
            Encrypt and decrypt files locally in your browser using RSA or ECC.
          </p>
        </div>
      </header>

      {/* MAIN CARD */}
      <div
        className="
          bg-gradient-to-br from-slate-900/90 to-slate-800/80
          border border-slate-700
          rounded-2xl
          shadow-xl shadow-slate-900/60
          overflow-hidden
          p-6
        "
      >
        <FileEncryptTab />
      </div>
    </div>
  );
}