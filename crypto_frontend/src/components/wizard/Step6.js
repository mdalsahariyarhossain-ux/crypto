import React from "react";
import { Unlock, Download } from "lucide-react";

export default function Step6({
  decrypting,
  encryptionResults,
  runDecryption,
  decryptionResults,
  uploadedFile,
  downloadBlob,
}) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <p className="text-sm text-slate-400">
        Decrypt the ciphertext payloads back to the original plaintext using
        the generated private keys.
      </p>

      <button
        disabled={decrypting || !encryptionResults}
        onClick={runDecryption}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-950 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50"
      >
        <Unlock className="w-4 h-4" />
        {decrypting ? "Decrypting..." : "Execute Decryption"}
      </button>

      {decryptionResults && (
        <div className="space-y-4">

          <div className="grid grid-cols-2 gap-4">

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                RSA Decrypted File
              </h4>

              <p className="text-2xl font-black text-cyan-400">
                {decryptionResults.times.rsa.toFixed(2)} ms
              </p>

              <p className="text-[10px] text-slate-500">
                Unwrap + AES-GCM Decrypt
              </p>

              <button
                onClick={() =>
                  downloadBlob(
                    decryptionResults.rsa,
                    uploadedFile
                      ? uploadedFile.name
                      : "decrypted_text.txt"
                  )
                }
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 text-[10px] font-bold text-slate-200 hover:border-cyan-400 hover:text-cyan-400 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download Decrypted File
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                ECC Decrypted File
              </h4>

              <p className="text-2xl font-black text-emerald-400">
                {decryptionResults.times.ecc.toFixed(2)} ms
              </p>

              <p className="text-[10px] text-slate-500">
                ECDH Derivation + AES-GCM Decrypt
              </p>

              <button
                onClick={() =>
                  downloadBlob(
                    decryptionResults.ecc,
                    uploadedFile
                      ? uploadedFile.name
                      : "decrypted_text.txt"
                  )
                }
                className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 text-[10px] font-bold text-slate-200 hover:border-emerald-400 hover:text-emerald-400 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Download Decrypted File
              </button>
            </div>

          </div>
                    {!uploadedFile && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-300 mb-2">
                Decrypted Message Snippet:
              </h4>

              <p className="text-sm font-semibold text-slate-100">
                {decryptionResults.rsaText}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}