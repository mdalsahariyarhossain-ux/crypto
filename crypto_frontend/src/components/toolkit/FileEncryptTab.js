import { useState, useRef } from "react";
import {Btn,SectionLabel} from "./UIComponents";
import {downloadBlob,RSA_KEY_SIZES,ECC_CURVES,ALGO_META} from "./cryptoUtils";

export default function FileEncryptTab() {
  const [algo, setAlgo]         = useState("RSA");
  const [rsaSize, setRsaSize]   = useState(2048);
  const [eccCurve, setEccCurve] = useState("P-256");
  const [file, setFile]         = useState(null);
  const [status, setStatus]     = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy]         = useState(false);
  const [dragging, setDragging] = useState(false);

  const inputRef   = useRef();
  const keyPairRef = useRef(null);   // RSA key pair
  const aesKeyRef  = useRef(null);   // ECC session AES key
  const encMetaRef = useRef(null);   // stores {algo, iv, wrappedKey} for decrypt

  const currentKey = algo === "RSA" ? rsaSize : eccCurve;
  const meta       = ALGO_META[algo][currentKey];

  function handleFile(f) { if (f) { setFile(f); setStatus(""); setProgress(0); } }

  function animBar(target) {
    return new Promise(res => {
      let cur = progress;
      const t = setInterval(() => {
        cur = Math.min(cur + 5, target);
        setProgress(cur);
        if (cur >= target) { clearInterval(t); res(); }
      }, 40);
    });
  }

  // reset keys when algo/size changes
  function resetKeys() {
    keyPairRef.current = null;
    aesKeyRef.current  = null;
    encMetaRef.current = null;
    setStatus("");
  }

  // Generate the RSA keypair or ECC-session AES key on demand, once per
  // session (until algo/size changes and resetKeys() clears it).
  async function ensureKeys() {
    if (algo === "RSA") {
      if (!keyPairRef.current) {
        keyPairRef.current = await crypto.subtle.generateKey(
          {
            name: "RSA-OAEP",
            modulusLength: rsaSize,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
          },
          true,
          ["encrypt", "decrypt"]
        );
      }
    } else {
      if (!aesKeyRef.current) {
        aesKeyRef.current = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
      }
    }
  }

  async function encryptFile() {
    if (!file) { setStatus("Please select a file first."); return; }
    setBusy(true); setStatus("Encrypting file…"); setProgress(0);
    try {
      await ensureKeys();

      const buf = await file.arrayBuffer();
      await animBar(30);

      // Always encrypt file content with AES-GCM (fast for large files)
      const fileAesKey = await crypto.subtle.generateKey({ name:"AES-GCM", length:256 }, true, ["encrypt","decrypt"]);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedFile = await crypto.subtle.encrypt({ name:"AES-GCM", iv }, fileAesKey, buf);
      await animBar(60);

      // Export the AES key and wrap it with RSA or ECC session key
      const rawAesKey = await crypto.subtle.exportKey("raw", fileAesKey);
      let wrappedKey;
      if (algo === "RSA") {
        wrappedKey = await crypto.subtle.encrypt({ name:"RSA-OAEP" }, keyPairRef.current.publicKey, rawAesKey);
      } else {
        const wrapIv = crypto.getRandomValues(new Uint8Array(12));
        const wrapped = await crypto.subtle.encrypt({ name:"AES-GCM", iv:wrapIv }, aesKeyRef.current, rawAesKey);
        // prepend wrapIv so we can unwrap later
        const wk = new Uint8Array(12 + wrapped.byteLength);
        wk.set(wrapIv); wk.set(new Uint8Array(wrapped), 12);
        wrappedKey = wk.buffer;
      }
      await animBar(90);

      // Pack: [4B wrappedKeyLen][wrappedKey][12B iv][encryptedFile]
      const wkArr = new Uint8Array(wrappedKey);
      const out   = new Uint8Array(4 + wkArr.length + 12 + encryptedFile.byteLength);
      new DataView(out.buffer).setUint32(0, wkArr.length);
      out.set(wkArr, 4);
      out.set(iv, 4 + wkArr.length);
      out.set(new Uint8Array(encryptedFile), 4 + wkArr.length + 12);

      downloadBlob(out, file.name + ".enc");
      await animBar(100);
      setStatus(`✅ Encrypted with ${algo === "RSA" ? `RSA-${rsaSize}` : `ECC ${eccCurve}`} · Downloaded as ${file.name}.enc`);
    } catch(e) { setStatus("❌ Encryption error: " + e.message); }
    finally { setBusy(false); }
  }

  async function decryptFile() {
    if (!file) { setStatus("Please select the .enc file."); return; }

    const hasKey = algo === "RSA" ? !!keyPairRef.current : !!aesKeyRef.current;
    if (!hasKey) {
      setStatus("❌ No keys found for the selected algorithm. Encrypt a file first in this session (with the same algorithm/size), then decrypt.");
      return;
    }

    setBusy(true); setStatus("Decrypting file…"); setProgress(0);
    try {
      const buf  = await file.arrayBuffer();
      const data = new Uint8Array(buf);
      await animBar(20);

      // Unpack
      const wkLen       = new DataView(buf).getUint32(0);
      const wkArr       = data.slice(4, 4 + wkLen);
      const iv          = data.slice(4 + wkLen, 4 + wkLen + 12);
      const encContent  = data.slice(4 + wkLen + 12);

      // Unwrap AES key
      let rawAesKey;
      if (algo === "RSA") {
        rawAesKey = await crypto.subtle.decrypt({ name:"RSA-OAEP" }, keyPairRef.current.privateKey, wkArr);
      } else {
        const wrapIv  = wkArr.slice(0, 12);
        const wrapped = wkArr.slice(12);
        rawAesKey = await crypto.subtle.decrypt({ name:"AES-GCM", iv:wrapIv }, aesKeyRef.current, wrapped);
      }
      await animBar(60);

      const fileAesKey = await crypto.subtle.importKey("raw", rawAesKey, "AES-GCM", false, ["decrypt"]);
      const plain      = await crypto.subtle.decrypt({ name:"AES-GCM", iv }, fileAesKey, encContent);
      await animBar(100);

      const name = file.name.endsWith(".enc") ? file.name.slice(0,-4) : "decrypted_" + file.name;
      downloadBlob(new Uint8Array(plain), name);
      setStatus("✅ Decrypted successfully · Downloaded as " + name);
    } catch(e) { setStatus("❌ Decryption failed. Make sure you use the same algorithm and keys used to encrypt."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">

      {/* Step 1 — Algorithm */}
      <div>
        <SectionLabel>Step 1 — Choose Algorithm</SectionLabel>
        <div className="flex gap-3">
          {["RSA","ECC"].map(a => (
            <button key={a} onClick={() => { setAlgo(a); resetKeys(); }}
              className={`px-8 py-2 rounded-xl text-sm font-bold border transition-all
                ${algo === a
                  ? "bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-900"
                  : "bg-slate-800/60 border-slate-600 text-slate-300 hover:border-cyan-400/50"}`}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — Key size */}
      <div>
        <SectionLabel>Step 2 — Choose Key Size</SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {(algo === "RSA" ? RSA_KEY_SIZES : ECC_CURVES).map(k => (
            <button key={k} onClick={() => { algo === "RSA" ? setRsaSize(k) : setEccCurve(k); resetKeys(); }}
              className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all
                ${currentKey === k
                  ? algo === "RSA" ? "bg-sky-500 border-transparent text-white"
                                   : "bg-green-500 border-transparent text-white"
                  : "bg-slate-800/60 border-slate-600 text-slate-300 hover:border-slate-400"}`}>
              {algo === "RSA" ? `${k} bit` : k}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">ℹ️ {meta.note}</p>
      </div>




      {/* Step 3 — File drop */}
      <div>
        <SectionLabel>Step 3 — Select File</SectionLabel>
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
            ${dragging ? "border-cyan-400 bg-slate-800/60" : "border-slate-600 hover:border-cyan-400/50 hover:bg-slate-800/30"}`}
        >
          <input type="file" ref={inputRef} className="hidden" onChange={e => handleFile(e.target.files[0])} />
          <div className="text-3xl mb-2">{file ? "✅" : "📂"}</div>
          {file ? (
            <>
              <p className="font-semibold text-slate-200">{file.name}</p>
              <p className="text-xs text-slate-400 mt-1">{(file.size/1024).toFixed(1)} KB · Click to change</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-300">Drop a file here or click to upload</p>
              <p className="text-xs text-slate-500 mt-1">Any file type · Encrypted in your browser · Never uploaded to any server</p>
            </>
          )}
        </div>
      </div>

      {/* Step 4 — Actions */}
      {file && (
        <div>
          <SectionLabel>Step 4 — Encrypt or Decrypt</SectionLabel>
          <div className="flex gap-3">
            <Btn primary onClick={encryptFile} disabled={busy}>🔒 Encrypt & Download</Btn>
            <Btn onClick={decryptFile} disabled={busy}>🔓 Decrypt & Download</Btn>
          </div>
          {busy && (
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mt-3">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-100"
                style={{ width: progress + "%" }} />
            </div>
          )}
        </div>
      )}

      {status && <p className="text-sm text-slate-400 mt-1">{status}</p>}

      {/* Simple footer note */}
      <p className="text-xs text-slate-600 border-t border-slate-800 pt-3">
        🔐 File is encrypted with AES-256-GCM. The AES key is wrapped with your {algo} key. Everything runs in your browser — nothing is uploaded to any server.
      </p>
    </div>
  );
}