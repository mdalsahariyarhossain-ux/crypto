import { useState, useRef } from "react";

// ── helpers ───────────────────────────────────────────────────────────────────

function ab2b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function downloadBlob(data, name) {
  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMat,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// ── Shared UI pieces ──────────────────────────────────────────────────────────

function StatCard({ label, value }) {
  return (
    <div className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3">
      <div className="text-lg font-bold text-cyan-400">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase mb-2">
      {children}
    </p>
  );
}

function OutputBox({ children, mono }) {
  return (
    <div className={`
      bg-slate-900/80 border border-slate-700 rounded-xl p-3
      text-sm text-slate-300 break-all min-h-[70px] max-h-[160px]
      overflow-y-auto leading-relaxed whitespace-pre-wrap
      ${mono ? "font-mono text-[11px]" : ""}
    `}>
      {children}
    </div>
  );
}

function Btn({ onClick, primary, disabled, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
        border transition-all active:scale-95
        disabled:opacity-40 disabled:cursor-not-allowed
        ${primary
          ? "bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-900 hover:from-cyan-400 hover:to-teal-400"
          : "bg-slate-800/60 border-slate-600 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-400"
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
}

// ── TAB 1: Encrypt / Decrypt ──────────────────────────────────────────────────

const RSA_KEY_SIZES = [1024, 2048, 3072];
const ECC_CURVES    = ["P-256", "P-384"];

const ALGO_META = {
  RSA: {
    1024: { sec: "80 bit",  spd: "Fast",   note: "Legacy — not recommended for new systems" },
    2048: { sec: "112 bit", spd: "Medium", note: "Current standard — widely used" },
    3072: { sec: "128 bit", spd: "Slow",   note: "High security — future-proof" },
  },
  ECC: {
    "P-256": { sec: "128 bit", spd: "Fast",        note: "Standard curve — used in TLS, Apple, Google" },
    "P-384": { sec: "192 bit", spd: "Medium-fast",  note: "High security — used in NSA Suite B" },
  },
};

function EncryptTab() {
  const [algo, setAlgo]           = useState("RSA");
  const [rsaSize, setRsaSize]     = useState(2048);
  const [eccCurve, setEccCurve]   = useState("P-256");
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [pubKey, setPubKey]       = useState("");
  const [privKey, setPrivKey]     = useState("");
  const [status, setStatus]       = useState("");

  const keyPairRef    = useRef(null);
  const aesKeyRef     = useRef(null);
  const lastCipherRef = useRef(null);
  // track which key was last generated so decrypt uses right one
  const lastAlgoRef   = useRef(null);
  const lastSizeRef   = useRef(null);

  const currentKey  = algo === "RSA" ? rsaSize : eccCurve;
  const meta        = ALGO_META[algo][currentKey];

  async function genKeys() {
    setStatus("Generating keys…");
    setPubKey(""); setPrivKey("");
    keyPairRef.current = null; aesKeyRef.current = null;
    try {
      if (algo === "RSA") {
        const kp = await crypto.subtle.generateKey(
          { name: "RSA-OAEP", modulusLength: rsaSize, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
          true, ["encrypt", "decrypt"]
        );
        keyPairRef.current = kp;
        lastAlgoRef.current = "RSA"; lastSizeRef.current = rsaSize;
        const pub  = await crypto.subtle.exportKey("spki", kp.publicKey);
        const priv = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
        setPubKey("-----BEGIN PUBLIC KEY-----\n"  + ab2b64(pub)  + "\n-----END PUBLIC KEY-----");
        setPrivKey("-----BEGIN PRIVATE KEY-----\n" + ab2b64(priv) + "\n-----END PRIVATE KEY-----");
        setStatus(`✅ RSA-${rsaSize} key pair generated.`);
      } else {
        const kp = await crypto.subtle.generateKey(
          { name: "ECDH", namedCurve: eccCurve }, true, ["deriveKey"]
        );
        keyPairRef.current = kp;
        lastAlgoRef.current = "ECC"; lastSizeRef.current = eccCurve;
        aesKeyRef.current = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
        );
        const pub  = await crypto.subtle.exportKey("spki", kp.publicKey);
        const priv = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
        setPubKey("-----BEGIN PUBLIC KEY-----\n"  + ab2b64(pub)  + "\n-----END PUBLIC KEY-----");
        setPrivKey("-----BEGIN PRIVATE KEY-----\n" + ab2b64(priv) + "\n-----END PRIVATE KEY-----");
        setStatus(`✅ ECC ${eccCurve} key pair generated.`);
      }
    } catch (e) { setStatus("❌ Key generation failed: " + e.message); }
  }

  async function doEncrypt() {
    if (!plaintext.trim()) { setStatus("Please enter a message."); return; }
    // auto-generate keys if none or algo/size changed
    if (!keyPairRef.current || lastAlgoRef.current !== algo || lastSizeRef.current !== currentKey) {
      await genKeys();
    }
    const enc = new TextEncoder();
    try {
      if (algo === "RSA") {
        const ct = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, keyPairRef.current.publicKey, enc.encode(plaintext));
        lastCipherRef.current = ct;
        setCiphertext(ab2b64(ct));
        setStatus(`✅ Encrypted with RSA-${rsaSize}-OAEP.`);
      } else {
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKeyRef.current, enc.encode(plaintext));
        const combined = new Uint8Array(iv.length + ct.byteLength);
        combined.set(iv); combined.set(new Uint8Array(ct), iv.length);
        lastCipherRef.current = combined.buffer;
        setCiphertext(ab2b64(combined.buffer));
        setStatus(`✅ Encrypted with ECC ${eccCurve} + AES-GCM.`);
      }
    } catch (e) { setStatus("❌ Encryption failed: " + e.message); }
  }

  async function doDecrypt() {
    if (!lastCipherRef.current) { setStatus("Encrypt a message first."); return; }
    try {
      let plain;
      if (lastAlgoRef.current === "RSA") {
        plain = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, keyPairRef.current.privateKey, lastCipherRef.current);
      } else {
        const data = new Uint8Array(lastCipherRef.current);
        plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: data.slice(0, 12) }, aesKeyRef.current, data.slice(12));
      }
      setPlaintext(new TextDecoder().decode(plain));
      setStatus("✅ Decrypted successfully.");
    } catch (e) { setStatus("❌ Decryption failed: " + e.message); }
  }

  return (
    <div className="space-y-5">

      {/* Step 1 — Algorithm */}
      <div>
        <SectionLabel>Step 1 — Choose Algorithm</SectionLabel>
        <div className="flex gap-3">
          {["RSA", "ECC"].map(a => (
            <button key={a} onClick={() => { setAlgo(a); keyPairRef.current = null; setCiphertext(""); setStatus(""); }}
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
            <button key={k}
              onClick={() => { algo === "RSA" ? setRsaSize(k) : setEccCurve(k); keyPairRef.current = null; setCiphertext(""); setStatus(""); }}
              className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all
                ${currentKey === k
                  ? algo === "RSA"
                    ? "bg-sky-500 border-transparent text-white"
                    : "bg-green-500 border-transparent text-white"
                  : "bg-slate-800/60 border-slate-600 text-slate-300 hover:border-slate-400"}`}>
              {algo === "RSA" ? `${k} bit` : k}
            </button>
          ))}
        </div>
        {/* Info note about selected key */}
        <p className="text-xs text-slate-500 mt-2">ℹ️ {meta.note}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <StatCard label="Key size"       value={algo === "RSA" ? `${rsaSize} bit` : eccCurve} />
        <StatCard label="Security level" value={meta.sec} />
        <StatCard label="Speed"          value={meta.spd} />
      </div>

      {/* Step 3 — Encrypt / Decrypt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <SectionLabel>Step 3 — Plaintext message</SectionLabel>
          <textarea rows={6} value={plaintext} onChange={e => setPlaintext(e.target.value)}
            placeholder="Type your secret message here…"
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2.5
              text-sm text-slate-200 placeholder-slate-500 resize-y
              focus:outline-none focus:border-cyan-500/60 transition" />
          <div className="flex gap-2">
            <Btn primary onClick={doEncrypt}>🔒 Encrypt</Btn>
            <Btn onClick={genKeys}>🔑 Generate keys</Btn>
          </div>
        </div>
        <div className="space-y-2">
          <SectionLabel>Ciphertext output</SectionLabel>
          <OutputBox>{ciphertext || "Encrypted output will appear here…"}</OutputBox>
          <div className="flex gap-2">
            <Btn onClick={doDecrypt}>🔓 Decrypt</Btn>
            <Btn onClick={() => ciphertext && navigator.clipboard.writeText(ciphertext).then(() => setStatus("📋 Copied!"))}>
              📋 Copy
            </Btn>
          </div>
        </div>
      </div>

      {/* Keys */}
      <div>
        <div className="border-t border-slate-700 my-2" />
        <SectionLabel>Generated Keys</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Public key (share this)</p>
            <OutputBox mono>{pubKey || "Not generated yet"}</OutputBox>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Private key (keep secret)</p>
            <OutputBox mono>{privKey || "Not generated yet"}</OutputBox>
          </div>
        </div>
      </div>

      {status && <p className="text-sm text-slate-400">{status}</p>}
    </div>
  );
}

// ── TAB 2: AI Advisor ─────────────────────────────────────────────────────────

const EXAMPLES = [
  { label: "🏦 Banking app",      text: "I want to secure login tokens for a mobile banking app" },
  { label: "🏥 Medical records",  text: "I need to encrypt patient health records in a hospital database" },
  { label: "💬 Chat app",         text: "I am building a chat app like WhatsApp with end-to-end encryption" },
  { label: "📦 Software signing", text: "I want to digitally sign software releases so users can verify authenticity" },
];

function AIAdvisorTab() {
  const [usecase, setUsecase] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!usecase.trim()) { setResponse("Please describe your use case above."); return; }
    setLoading(true); setResponse("");
    try {
      const res = await fetch("http://localhost:4000/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: usecase }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("") || "Could not get a response.";
      setResponse(text);
    } catch (e) { setResponse("Error connecting to AI. Please check your connection."); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-4">
      <SectionLabel>Describe your use case</SectionLabel>
      <textarea
        rows={4}
        value={usecase}
        onChange={e => setUsecase(e.target.value)}
        placeholder="E.g. I want to encrypt medical records in a hospital system…"
        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2.5
          text-sm text-slate-200 placeholder-slate-500 resize-none
          focus:outline-none focus:border-cyan-500/60 transition"
      />

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => setUsecase(ex.text)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg
              bg-slate-800/60 border border-slate-600 text-slate-300
              hover:border-cyan-400/50 hover:text-cyan-400 transition"
          >
            {ex.label}
          </button>
        ))}
      </div>

      <Btn primary onClick={askAI} disabled={loading}>
        {loading ? "⏳ Thinking…" : "✨ Ask AI Advisor"}
      </Btn>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-2 h-2 rounded-full ${loading ? "bg-cyan-400 animate-pulse" : "bg-slate-600"}`} />
          <span className="text-xs text-slate-400">{loading ? "AI is thinking…" : "AI Advisor"}</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4
          text-sm text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[100px]">
          {response || "Describe your project above and the AI will recommend RSA or ECC, explain why, and outline implementation steps."}
        </div>
      </div>
    </div>
  );
}

// ── TAB 3: File Encryption ────────────────────────────────────────────────────

function FileEncryptTab() {
  const [algo, setAlgo]         = useState("RSA");
  const [rsaSize, setRsaSize]   = useState(2048);
  const [eccCurve, setEccCurve] = useState("P-256");
  const [file, setFile]         = useState(null);
  const [status, setStatus]     = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy]         = useState(false);
  const [dragging, setDragging] = useState(false);
  const [keyGenerated, setKeyGenerated] = useState(false);

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
    setKeyGenerated(false);
    setStatus("");
  }

  async function generateKeys() {
    setStatus("Generating keys…");
    try {
      if (algo === "RSA") {
        const kp = await crypto.subtle.generateKey(
          { name: "RSA-OAEP", modulusLength: rsaSize, publicExponent: new Uint8Array([1,0,1]), hash: "SHA-256" },
          true, ["encrypt", "decrypt"]
        );
        keyPairRef.current = kp;
      } else {
        // ECC: generate ECDH pair + ephemeral AES session key
        const kp = await crypto.subtle.generateKey(
          { name: "ECDH", namedCurve: eccCurve }, true, ["deriveKey"]
        );
        keyPairRef.current = kp;
        aesKeyRef.current = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
        );
      }
      setKeyGenerated(true);
      setStatus(`✅ ${algo === "RSA" ? `RSA-${rsaSize}` : `ECC ${eccCurve}`} keys ready.`);
    } catch(e) { setStatus("❌ Key generation failed: " + e.message); }
  }

  async function encryptFile() {
    if (!file) { setStatus("Please select a file first."); return; }
    if (!keyPairRef.current) { await generateKeys(); }
    setBusy(true); setStatus("Encrypting file…"); setProgress(0);
    try {
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
    if (!keyPairRef.current) { setStatus("❌ No keys found. Generate keys first, then encrypt a file, then decrypt."); return; }
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
    } catch(e) { setStatus("❌ Decryption failed. Make sure you use the same keys used to encrypt."); }
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



      {/* Step 3 — Generate keys */}
      <div>
        <SectionLabel>Step 3 — Generate Keys</SectionLabel>
        <Btn primary={!keyGenerated} onClick={generateKeys}>
          {keyGenerated ? "🔄 Regenerate Keys" : "🔑 Generate Keys"}
        </Btn>
        {keyGenerated && (
          <p className="text-xs text-green-400 mt-2">
            ✅ {algo === "RSA" ? `RSA-${rsaSize}` : `ECC ${eccCurve}`} keys ready — keep this tab open while encrypting/decrypting
          </p>
        )}
      </div>

      {/* Step 4 — File drop */}
      <div>
        <SectionLabel>Step 4 — Select File</SectionLabel>
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

      {/* Step 5 — Actions */}
      {file && (
        <div>
          <SectionLabel>Step 5 — Encrypt or Decrypt</SectionLabel>
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

// ── Main Component ────────────────────────────────────────────────────────────

const TABS = [
  { id: "encrypt", label: "🔒 Encrypt / Decrypt" },
  { id: "ai",      label: "✨ AI Advisor" },
  { id: "file",    label: "📂 File Encryption" },
];

export default function CryptoToolkit() {
  const [active, setActive] = useState("encrypt");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">Crypto Toolkit</h2>
        <p className="text-sm text-slate-400 mt-1">
          Real-world cryptography — encrypt messages, get AI recommendations, protect files
        </p>
      </div>

      {/* Card */}
      <div className="
        bg-gradient-to-br from-slate-900/90 to-slate-800/80
        border border-slate-700
        rounded-2xl
        shadow-xl shadow-slate-900/60
        overflow-hidden
      ">
        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/60">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`
                flex-1 py-3 px-2 text-sm font-semibold transition-all
                ${active === t.id
                  ? "text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/40"
                  : "text-slate-400 hover:text-slate-200 border-b-2 border-transparent"}
              `}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="p-6">
          {active === "encrypt" && <EncryptTab />}
          {active === "ai"      && <AIAdvisorTab />}
          {active === "file"    && <FileEncryptTab />}
        </div>
      </div>
    </div>
  );
}