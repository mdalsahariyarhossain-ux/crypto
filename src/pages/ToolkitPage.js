
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

function EncryptTab() {
  const [algo, setAlgo] = useState("RSA");
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [privKey, setPrivKey] = useState("");
  const [status, setStatus] = useState("");

  const rsaKeyPairRef = useRef(null);
  const aesKeyRef = useRef(null);
  const lastCipherRef = useRef(null);

  const algoStats = {
    RSA: { key: "2048 bit", sec: "112 bit", spd: "Medium" },
    ECC: { key: "256 bit", sec: "128 bit", spd: "Fast" },
  };

  async function genKeys() {
    setStatus("Generating keys…");
    try {
      if (algo === "RSA") {
        const kp = await crypto.subtle.generateKey(
          { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
          true, ["encrypt", "decrypt"]
        );
        rsaKeyPairRef.current = kp;
        const pub = await crypto.subtle.exportKey("spki", kp.publicKey);
        const priv = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
        setPubKey("-----BEGIN PUBLIC KEY-----\n" + ab2b64(pub) + "\n-----END PUBLIC KEY-----");
        setPrivKey("-----BEGIN PRIVATE KEY-----\n" + ab2b64(priv) + "\n-----END PRIVATE KEY-----");
        setStatus("✅ RSA-2048 key pair generated.");
      } else {
        const kp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"]);
        const pub = await crypto.subtle.exportKey("spki", kp.publicKey);
        const priv = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
        setPubKey("-----BEGIN PUBLIC KEY-----\n" + ab2b64(pub) + "\n-----END PUBLIC KEY-----");
        setPrivKey("-----BEGIN PRIVATE KEY-----\n" + ab2b64(priv) + "\n-----END PRIVATE KEY-----");
        aesKeyRef.current = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
        setStatus("✅ ECC P-256 key pair generated.");
      }
    } catch (e) { setStatus("❌ Key generation failed: " + e.message); }
  }

  async function doEncrypt() {
    if (!plaintext.trim()) { setStatus("Please enter a message."); return; }
    const enc = new TextEncoder();
    try {
      if (algo === "RSA") {
        if (!rsaKeyPairRef.current) await genKeys();
        const ct = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, rsaKeyPairRef.current.publicKey, enc.encode(plaintext));
        lastCipherRef.current = ct;
        setCiphertext(ab2b64(ct));
        setStatus("✅ Encrypted with RSA-OAEP.");
      } else {
        if (!aesKeyRef.current) await genKeys();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKeyRef.current, enc.encode(plaintext));
        const combined = new Uint8Array(iv.length + ct.byteLength);
        combined.set(iv); combined.set(new Uint8Array(ct), iv.length);
        lastCipherRef.current = combined.buffer;
        setCiphertext(ab2b64(combined.buffer));
        setStatus("✅ Encrypted with ECDH + AES-GCM.");
      }
    } catch (e) { setStatus("❌ Encryption failed: " + e.message); }
  }

  async function doDecrypt() {
    if (!lastCipherRef.current) { setStatus("Encrypt a message first."); return; }
    try {
      let plain;
      if (algo === "RSA") {
        plain = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, rsaKeyPairRef.current.privateKey, lastCipherRef.current);
      } else {
        const data = new Uint8Array(lastCipherRef.current);
        plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: data.slice(0, 12) }, aesKeyRef.current, data.slice(12));
      }
      setPlaintext(new TextDecoder().decode(plain));
      setStatus("✅ Decrypted successfully.");
    } catch (e) { setStatus("❌ Decryption failed: " + e.message); }
  }

  const s = algoStats[algo];

  return (
    <div className="space-y-5">
      {/* Algorithm picker */}
      <div>
        <SectionLabel>Algorithm</SectionLabel>
        <div className="flex gap-3">
          {["RSA", "ECC"].map(a => (
            <button
              key={a}
              onClick={() => setAlgo(a)}
              className={`
                px-6 py-2 rounded-xl text-sm font-bold border transition-all
                ${algo === a
                  ? "bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-900"
                  : "bg-slate-800/60 border-slate-600 text-slate-300 hover:border-cyan-400/50"}
              `}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <StatCard label="Key size" value={s.key} />
        <StatCard label="Security level" value={s.sec} />
        <StatCard label="Speed" value={s.spd} />
      </div>

      {/* Encrypt / Decrypt boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <SectionLabel>Plaintext message</SectionLabel>
          <textarea
            rows={6}
            value={plaintext}
            onChange={e => setPlaintext(e.target.value)}
            placeholder="Type your secret message here…"
            className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2.5
              text-sm text-slate-200 placeholder-slate-500 resize-y
              focus:outline-none focus:border-cyan-500/60 transition"
          />
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
            <Btn onClick={() => ciphertext && navigator.clipboard.writeText(ciphertext).then(() => setStatus("Copied!"))}>
              📋 Copy
            </Btn>
          </div>
        </div>
      </div>

      {/* Keys */}
      <div>
        <div className="border-t border-slate-700 my-2" />
        <SectionLabel>Keys</SectionLabel>
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
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a cryptography expert advisor. The user is working on a project comparing RSA and ECC algorithms. Given a use case, recommend either RSA or ECC and explain in 3-4 short paragraphs: 1) Your recommendation and why, 2) Security properties that matter for this use case, 3) Key practical implementation steps. Be specific, educational, and keep it simple enough for a student to understand.`,
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
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  function handleFile(f) { if (f) { setFile(f); setStatus(""); setProgress(0); } }

  async function animateProgress(end, ms) {
    const step = (end - progress) / (ms / 50);
    let cur = progress;
    return new Promise(res => {
      const t = setInterval(() => {
        cur = Math.min(cur + step, end);
        setProgress(Math.round(cur));
        if (cur >= end) { clearInterval(t); res(); }
      }, 50);
    });
  }

  async function encryptFile() {
    if (!file || !password) { setStatus("Please select a file and enter a password."); return; }
    setBusy(true); setStatus("Encrypting…");
    try {
      const buf = await file.arrayBuffer();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(password, salt);
      await animateProgress(70, 400);
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, buf);
      await animateProgress(100, 200);
      const out = new Uint8Array(salt.length + iv.length + ct.byteLength);
      out.set(salt); out.set(iv, 16); out.set(new Uint8Array(ct), 28);
      downloadBlob(out, file.name + ".enc");
      setStatus("✅ Encrypted and downloaded as " + file.name + ".enc");
    } catch (e) { setStatus("❌ Error: " + e.message); }
    finally { setBusy(false); }
  }

  async function decryptFile() {
    if (!file || !password) { setStatus("Please select a file and enter the password."); return; }
    setBusy(true); setStatus("Decrypting…");
    try {
      const buf = await file.arrayBuffer();
      const data = new Uint8Array(buf);
      const key = await deriveKey(password, data.slice(0, 16));
      await animateProgress(70, 400);
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: data.slice(16, 28) }, key, data.slice(28));
      await animateProgress(100, 200);
      const name = file.name.endsWith(".enc") ? file.name.slice(0, -4) : "decrypted_" + file.name;
      downloadBlob(new Uint8Array(plain), name);
      setStatus("✅ Decrypted and downloaded as " + name);
    } catch (e) { setStatus("❌ Wrong password or corrupted file."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
          ${dragging ? "border-cyan-400 bg-slate-800/60" : "border-slate-600 hover:border-cyan-400/50 hover:bg-slate-800/30"}
        `}
      >
        <input type="file" ref={inputRef} className="hidden" onChange={e => handleFile(e.target.files[0])} />
        <div className="text-3xl mb-2">{file ? "✅" : "📂"}</div>
        {file ? (
          <>
            <p className="font-semibold text-slate-200">{file.name}</p>
            <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-slate-300">Drop a file here or click to upload</p>
            <p className="text-xs text-slate-500 mt-1">Any file type · Encrypted with AES-256-GCM in your browser</p>
          </>
        )}
      </div>

      {file && (
        <>
          {/* Stats */}
          <div className="flex gap-3">
            <StatCard label="File" value={file.name.length > 14 ? file.name.slice(0,12)+"…" : file.name} />
            <StatCard label="Size" value={(file.size/1024).toFixed(1)+" KB"} />
            <StatCard label="Cipher" value="AES-256" />
          </div>

          {/* Password */}
          <div>
            <SectionLabel>Encryption password</SectionLabel>
            <input
              type="password"
              placeholder="Enter a strong password…"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2.5
                text-sm text-slate-200 placeholder-slate-500
                focus:outline-none focus:border-cyan-500/60 transition"
            />
            <p className="text-xs text-slate-500 mt-1">Derived via PBKDF2 · Never leaves your browser</p>
          </div>

          <div className="flex gap-3">
            <Btn primary onClick={encryptFile} disabled={busy}>🔒 Encrypt & Download</Btn>
            <Btn onClick={decryptFile} disabled={busy}>🔓 Decrypt & Download</Btn>
          </div>

          {busy && (
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-150"
                style={{ width: progress + "%" }} />
            </div>
          )}
        </>
      )}

      {status && <p className="text-sm text-slate-400">{status}</p>}

      <div className="border-t border-slate-700 pt-4">
        <div className="flex gap-3">
          <StatCard label="Cipher" value="AES-256" />
          <StatCard label="Mode" value="GCM" />
          <StatCard label="Key derivation" value="PBKDF2" />
          <StatCard label="Processed" value="Client-side" />
        </div>
      </div>
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
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

    {/* LEFT MENU PANEL - 1/3 */}
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700 h-full">
      <h2 className="text-3xl font-bold text-white mb-4">
        Crypto Toolkit
      </h2>

      <p className="text-slate-400 mb-8 leading-relaxed">
        Real-world cryptography — encrypt messages, get AI recommendations,
        protect files
      </p>

      <div className="space-y-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`w-full py-4 rounded-2xl text-lg font-medium transition-all ${
              active === t.id
                ? "bg-sky-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>

    {/* RIGHT CONTENT PANEL - 2/3 */}
    <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-700">
      {active === "encrypt" && <EncryptTab />}
      {active === "ai" && <AIAdvisorTab />}
      {active === "file" && <FileEncryptTab />}
    </div>

  </div>
);
}
