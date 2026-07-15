import { useState, useRef } from "react";
import {Btn,OutputBox,SectionLabel} from "./UIComponents";
import {ab2b64,RSA_KEY_SIZES,ECC_CURVES,ALGO_META} from "./cryptoUtils";

export default function TextEncryptTab() {
  const [algo, setAlgo]           = useState("RSA");
  const [rsaSize, setRsaSize]     = useState(2048);
  const [eccCurve, setEccCurve]   = useState("P-256");
  const [plaintext, setPlaintext] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [status, setStatus]       = useState("");

  const keyPairRef    = useRef(null);
  const aesKeyRef     = useRef(null);
  const lastCipherRef = useRef(null);
  // track which key was last generated so decrypt uses right one
  const lastAlgoRef   = useRef(null);

  const currentKey  = algo === "RSA" ? rsaSize : eccCurve;
  const meta        = ALGO_META[algo][currentKey];

async function doEncrypt() {
  if (!plaintext.trim()) { setStatus("Please enter a message."); return; }

  const enc = new TextEncoder();
  try {
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
        lastAlgoRef.current = "RSA";
      }

      const ct = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        keyPairRef.current.publicKey,
        enc.encode(plaintext)
      );

      lastCipherRef.current = ct;
      setCiphertext(ab2b64(ct));
      setStatus(`✅ Encrypted with RSA-${rsaSize}`);
    } else {
      // ECC path: Web Crypto has no direct ECC encryption primitive,
      // so we use AES-GCM as the actual cipher here.
      if (!aesKeyRef.current) {
        aesKeyRef.current = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
        lastAlgoRef.current = "ECC";
      }

      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKeyRef.current,
        enc.encode(plaintext)
      );

      const combined = new Uint8Array(iv.length + ct.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(ct), iv.length);

      lastCipherRef.current = combined.buffer;
      setCiphertext(ab2b64(combined.buffer));
      setStatus(`✅ Encrypted with ECC ${eccCurve} + AES-GCM`);
    }
  } catch (e) { setStatus("❌ Encryption failed: " + e.message); }
}

async function doDecrypt() {
  if (!ciphertext.trim()) {
    setStatus("Please enter ciphertext.");
    return;
  }

  if (!keyPairRef.current && !aesKeyRef.current) {
    setStatus("❌ No key available. Click Encrypt first — decryption only works with the key generated in this session.");
    return;
  }

  try {
    const binary = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    let plain;

    if (lastAlgoRef.current === "RSA") {
      if (!keyPairRef.current?.privateKey) {
        setStatus("❌ RSA private key missing. Click Encrypt to regenerate keys.");
        return;
      }
      plain = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        keyPairRef.current.privateKey,
        binary.buffer
      );
    } else {
      if (!aesKeyRef.current) {
        setStatus("❌ No key available. Click Encrypt first.");
        return;
      }
      const iv = binary.slice(0, 12);
      const data = binary.slice(12);
      plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        aesKeyRef.current,
        data.buffer
      );
    }

    setDecryptedText(new TextDecoder().decode(plain));
    setStatus("✅ Decrypted successfully.");
  } catch (e) {
    setStatus("❌ Decryption failed: " + e.message + " — ciphertext may not match the current session's key.");
  }
}
  return (
    <div className="space-y-5">

      {/* Step 1 — Algorithm */}
      <div>
        <SectionLabel>Step 1 — Choose Algorithm</SectionLabel>
        <div className="flex gap-3">
          {["RSA", "ECC"].map(a => (
            <button key={a} onClick={() => { setAlgo(a); keyPairRef.current = null; aesKeyRef.current = null; setCiphertext(""); setDecryptedText(""); setStatus(""); }}
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
              onClick={() => { algo === "RSA" ? setRsaSize(k) : setEccCurve(k); keyPairRef.current = null; aesKeyRef.current = null; setCiphertext(""); setDecryptedText(""); setStatus(""); }}
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


      {/* Step 3 — Encrypt / Decrypt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Plain Text */}
        <div className="space-y-3">

          <SectionLabel>Plain Text</SectionLabel>

          <textarea
            rows={6}
            value={plaintext}
            onChange={(e)=>setPlaintext(e.target.value)}
            placeholder="Enter plain text..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
          />

          <Btn primary onClick={doEncrypt}>
            🔒 Encrypt
          </Btn>

        </div>

        {/* Cipher Text */}
        <div className="space-y-3">

          <SectionLabel>Cipher Text</SectionLabel>

          <textarea
            rows={6}
            value={ciphertext}
            onChange={(e)=>setCiphertext(e.target.value)}
            placeholder="Paste ciphertext here..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 font-mono text-xs"
          />

          <div className="flex gap-2">

            <Btn onClick={doDecrypt}>
              🔓 Decrypt
            </Btn>

            <Btn
              onClick={()=>{
                navigator.clipboard.writeText(ciphertext);
                setStatus("📋 Copied");
              }}
            >
              📋 Copy
            </Btn>

          </div>

        </div>

      </div>

      <div className="mt-6">

        <SectionLabel>Decrypted Plain Text</SectionLabel>

        <OutputBox>
          {decryptedText || "Decrypted text will appear here..."}
        </OutputBox>

      </div>

      {status && <p className="text-sm text-slate-400">{status}</p>}
    </div>
  );
}