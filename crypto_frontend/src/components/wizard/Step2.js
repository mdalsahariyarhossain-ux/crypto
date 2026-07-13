import React from "react";
import { Lock, Download } from "lucide-react";

export default function Step2({
  encrypting,
  runEncryption,
  inputBuffer,
  encryptionResults,
  uploadedFile,
  downloadBlob,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <p className="text-sm text-slate-400">
        Encrypt your input using the generated RSA and ECC key pairs.
        Download buttons will be available for each encrypted output.
      </p>

      <button
        disabled={encrypting || !inputBuffer}
        onClick={runEncryption}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-950 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50"
      >
        <Lock className="w-4 h-4" />
        {encrypting ? "Encrypting..." : "Execute Encryption"}
      </button>

      {encryptionResults && (
        <div className="space-y-4">

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                RSA Encrypted File
              </h4>

              <p className="text-2xl font-black text-cyan-400">
                {encryptionResults.times.rsa.toFixed(2)} ms
              </p>

              <p className="text-[10px] text-slate-500">
                RSA-OAEP + AES-256-GCM
              </p>

              <button
                onClick={() =>
                  downloadBlob(
                    encryptionResults.rsa,
                    (uploadedFile ? uploadedFile.name : "text") + "_rsa.enc"
                  )
                }
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 text-[10px] font-bold text-slate-200 hover:border-cyan-400 hover:text-cyan-400 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download Encrypted File
              </button>
            </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                ECC Encrypted File
              </h4>

              <p className="text-2xl font-black text-emerald-400">
                {encryptionResults.times.ecc.toFixed(2)} ms
              </p>

              <p className="text-[10px] text-slate-500">
                ECIES (ECDH) + AES-256-GCM
              </p>

              <button
                onClick={() =>
                  downloadBlob(
                    encryptionResults.ecc,
                    (uploadedFile ? uploadedFile.name : "text") + "_ecc.enc"
                  )
                }
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 text-[10px] font-bold text-slate-200 hover:border-emerald-400 hover:text-emerald-400 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download Encrypted File
              </button>
            </div>

          </div>
                    <details className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-[10px]">
            <summary className="cursor-pointer font-bold text-slate-400">
              View Ciphertext Snippets (Base64)
            </summary>

            <div className="mt-3 grid grid-cols-2 gap-4">

              <div>
                <p className="font-bold text-cyan-300 mb-1">
                  RSA Output:
                </p>

                <pre className="whitespace-pre-wrap break-all bg-slate-950 p-2 border border-slate-800/60 max-h-36 overflow-y-auto text-slate-400 leading-tight">
                  {encryptionResults.rsaB64.slice(0, 1000)}...
                </pre>
              </div>

              <div>
                <p className="font-bold text-emerald-300 mb-1">
                  ECC ECIES Output:
                </p>

                <pre className="whitespace-pre-wrap break-all bg-slate-950 p-2 border border-slate-800/60 max-h-36 overflow-y-auto text-slate-400 leading-tight">
                  {encryptionResults.eccB64.slice(0, 1000)}...
                </pre>
              </div>

            </div>
          </details>
            </div>
      )}
    </div>
  );
}