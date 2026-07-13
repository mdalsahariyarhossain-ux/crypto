import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Key,
  Lock,
  Unlock,
  BarChart2,
  LineChart as LineIcon,
  Sparkles,
  AlertCircle
} from "lucide-react";

import ConfigBar from "../components/wizard/ConfigBar";
import Sidebar from "../components/wizard/Sidebar";
import BottomNav from "../components/wizard/BottomNav";
import Step1 from "../components/wizard/Step1";
import Step2 from "../components/wizard/Step2";
import Step3 from "../components/wizard/Step3";
import Step4 from "../components/wizard/Step4";
import Step5 from "../components/wizard/Step5";
import Step6 from "../components/wizard/Step6";
import Step7 from "../components/wizard/Step7";
import Step8 from "../components/wizard/Step8";
import Step9 from "../components/wizard/Step9";

// Helper functions for base64 and PEM conversions
function ab2b64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function formatPEM(b64, label) {
  if (!b64) return "";
  const matches = b64.match(/.{1,64}/g);
  return `-----BEGIN ${label}-----\n${matches ? matches.join("\n") : b64}\n-----END ${label}-----`;
}

function downloadBlob(data, name) {
  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

// Key size / input are now chosen once on the home page, so the wizard
// starts straight at key generation instead of repeating that step.
const STEPS = [
  { id: 1, label: "Key Generation (RSA & ECC)", icon: Key },
  { id: 2, label: "Encryption of File", icon: Lock },
  { id: 3, label: "Sig + Verify + KeyGen Graph", icon: BarChart2 },
  { id: 4, label: "Encryption Time Bar Graph", icon: BarChart2 },
  { id: 5, label: "Encryption Performance Chart", icon: LineIcon },
  { id: 6, label: "Decrypt the File", icon: Unlock },
  { id: 7, label: "Decryption Time Bar Graph", icon: BarChart2 },
  { id: 8, label: "Decryption Performance Chart", icon: LineIcon },
  { id: 9, label: "Overall Performance Summary", icon: Sparkles }
];

const TOTAL_STEPS = STEPS.length;

export default function WizardFlowPage() {
  const location = useLocation();
  const fromHome = location.state;
  const [activeStep, setActiveStep] = useState(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState(1);

  // Config + input arrive from the home page Quick Start card.
  const [keyConfig] = useState(fromHome?.keyConfig || "A"); // "A": RSA-2048/P-256, "B": RSA-3072/P-384
  const [inputText] = useState(fromHome?.inputText || "");
  const [uploadedFile] = useState(fromHome?.uploadedFile || null); // { name, size }
  const [inputBuffer] = useState(fromHome?.inputBuffer || null);

  // Step 1: Keys
  const [keys, setKeys] = useState(null);
  const [keyTimes, setKeyTimes] = useState(null);
  const [showKeys, setShowKeys] = useState(false);
  const [keygenRunning, setKeygenRunning] = useState(false);

  // Step 2: Encryption
  const [encryptionResults, setEncryptionResults] = useState(null);
  const [encrypting, setEncrypting] = useState(false);

  // Step 3: Sign/Verify Benchmark (20 runs)
  const [sigBenchData, setSigBenchData] = useState([]);
  const [sigBenchRunning, setSigBenchRunning] = useState(false);

  // Step 4/5: Encryption Benchmark (30 runs)
  const [encBenchAvg, setEncBenchAvg] = useState([]);
  const [encBenchRaw, setEncBenchRaw] = useState([]); // Raw 30 run times
  const [encBenchRunning, setEncBenchRunning] = useState(false);

  // Step 6: Decryption
  const [decryptionResults, setDecryptionResults] = useState(null);
  const [decrypting, setDecrypting] = useState(false);

  // Step 7/8: Decryption Benchmark (30 runs)
  const [decBenchAvg, setDecBenchAvg] = useState([]);
  const [decBenchRaw, setDecBenchRaw] = useState([]); // Raw 30 run times
  const [decBenchRunning, setDecBenchRunning] = useState(false);

  // Step 9: Summary & AI recommendation
  const [aiReport, setAiReport] = useState("");

  // Status updates
  const [status, setStatus] = useState("");

  const rsaBits = keyConfig === "A" ? 2048 : 3072;
  const eccCurve = keyConfig === "A" ? "P-256" : "P-384";

  // Trigger scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStep]);

  // Step 1: Key Generation
  const generateKeys = async () => {
    setKeygenRunning(true);
    setStatus("Generating cryptographic key pairs in browser...");
    setKeys(null);
    setKeyTimes(null);

    try {
      // RSA Key Generation
      const t0 = performance.now();
      const rsaOaepPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: rsaBits,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
      );

      const rsaPssPair = await crypto.subtle.generateKey(
        {
          name: "RSA-PSS",
          modulusLength: rsaBits,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256"
        },
        true,
        ["sign", "verify"]
      );
      const rsaTime = performance.now() - t0;

      // ECC Key Generation
      const t1 = performance.now();
      const eccEcdhPair = await crypto.subtle.generateKey(
        {
          name: "ECDH",
          namedCurve: eccCurve
        },
        true,
        ["deriveKey"]
      );

      const eccEcdsaPair = await crypto.subtle.generateKey(
        {
          name: "ECDSA",
          namedCurve: eccCurve
        },
        true,
        ["sign", "verify"]
      );
      const eccTime = performance.now() - t1;

      // Export keys to display them
      const rsaPubSpki = await crypto.subtle.exportKey("spki", rsaOaepPair.publicKey);
      const rsaPrivPkcs8 = await crypto.subtle.exportKey("pkcs8", rsaOaepPair.privateKey);

      const eccPubSpki = await crypto.subtle.exportKey("spki", eccEcdhPair.publicKey);
      const eccPrivPkcs8 = await crypto.subtle.exportKey("pkcs8", eccEcdhPair.privateKey);

      setKeys({
        rsaOaep: rsaOaepPair,
        rsaPss: rsaPssPair,
        eccEcdh: eccEcdhPair,
        eccEcdsa: eccEcdsaPair,
        rsaPEM: {
          public: formatPEM(ab2b64(rsaPubSpki), "PUBLIC KEY"),
          private: formatPEM(ab2b64(rsaPrivPkcs8), "PRIVATE KEY")
        },
        eccPEM: {
          public: formatPEM(ab2b64(eccPubSpki), "PUBLIC KEY"),
          private: formatPEM(ab2b64(eccPrivPkcs8), "PRIVATE KEY")
        }
      });

      setKeyTimes({ rsa: rsaTime, ecc: eccTime });
      setStatus("✅ Key pairs generated successfully.");
      if (maxCompletedStep < 1) setMaxCompletedStep(1);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Key generation failed: ${e.message}`);
    } finally {
      setKeygenRunning(false);
    }
  };

  // Step 2: Encryption
  const runEncryption = async () => {
    if (!inputBuffer) {
      setStatus("No input found — please add text or a file on the home page first.");
      return;
    }
    if (!keys) {
      setStatus("Please generate keys in Step 1 first.");
      return;
    }

    setEncrypting(true);
    setStatus("Encrypting file with RSA and ECC (ECIES)...");
    setEncryptionResults(null);

    try {
      // 1. RSA-OAEP + AES-GCM hybrid encryption
      const rsaStart = performance.now();
      const aesKeyRsa = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      const aesRawRsa = await crypto.subtle.exportKey("raw", aesKeyRsa);
      const wrappedKeyRsa = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        keys.rsaOaep.publicKey,
        aesRawRsa
      );

      const ivRsa = crypto.getRandomValues(new Uint8Array(12));
      const cipherRsa = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: ivRsa },
        aesKeyRsa,
        inputBuffer
      );

      // Pack RSA format: [4B wrapped key len][wrapped key][12B IV][ciphertext]
      const packedRsa = new Uint8Array(4 + wrappedKeyRsa.byteLength + 12 + cipherRsa.byteLength);
      const viewRsa = new DataView(packedRsa.buffer);
      viewRsa.setUint32(0, wrappedKeyRsa.byteLength);
      packedRsa.set(new Uint8Array(wrappedKeyRsa), 4);
      packedRsa.set(ivRsa, 4 + wrappedKeyRsa.byteLength);
      packedRsa.set(new Uint8Array(cipherRsa), 4 + wrappedKeyRsa.byteLength + 12);
      const rsaTime = performance.now() - rsaStart;

      // 2. ECC ECIES hybrid encryption
      const eccStart = performance.now();
      const ephemeralKeyPair = await crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: eccCurve },
        true,
        ["deriveKey"]
      );
      const sharedKeyEcc = await crypto.subtle.deriveKey(
        { name: "ECDH", public: keys.eccEcdh.publicKey },
        ephemeralKeyPair.privateKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      const ivEcc = crypto.getRandomValues(new Uint8Array(12));
      const cipherEcc = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: ivEcc },
        sharedKeyEcc,
        inputBuffer
      );

      const ephemPubRaw = await crypto.subtle.exportKey("raw", ephemeralKeyPair.publicKey);

      // Pack ECC ECIES format: [4B ephemeral pub key len][ephem pub key][12B IV][ciphertext]
      const packedEcc = new Uint8Array(4 + ephemPubRaw.byteLength + 12 + cipherEcc.byteLength);
      const viewEcc = new DataView(packedEcc.buffer);
      viewEcc.setUint32(0, ephemPubRaw.byteLength);
      packedEcc.set(new Uint8Array(ephemPubRaw), 4);
      packedEcc.set(ivEcc, 4 + ephemPubRaw.byteLength);
      packedEcc.set(new Uint8Array(cipherEcc), 4 + ephemPubRaw.byteLength + 12);
      const eccTime = performance.now() - eccStart;

      setEncryptionResults({
        rsa: packedRsa,
        ecc: packedEcc,
        rsaB64: ab2b64(packedRsa.buffer),
        eccB64: ab2b64(packedEcc.buffer),
        times: { rsa: rsaTime, ecc: eccTime }
      });
      setStatus("✅ File encrypted successfully with both algorithms.");
      if (maxCompletedStep < 2) setMaxCompletedStep(2);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Encryption failed: ${e.message}`);
    } finally {
      setEncrypting(false);
    }
  };

  // Step 3: Digital Signature + Verification + KeyGen (20 runs)
  const runSigBenchmark = async () => {
    setSigBenchRunning(true);
    setStatus("Running 20 signature & verification benchmarks...");
    setSigBenchData([]);

    try {
      const data = new TextEncoder().encode("SigBenchmarkDataText");
      let rsaKg = [], rsaSign = [], rsaVerify = [];
      let eccKg = [], eccSign = [], eccVerify = [];

      for (let i = 0; i < 20; i++) {
        // RSA Benchmark
        let t = performance.now();
        const rsaPair = await crypto.subtle.generateKey(
          {
            name: "RSA-PSS",
            modulusLength: rsaBits,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
          },
          true,
          ["sign", "verify"]
        );
        rsaKg.push(performance.now() - t);

        t = performance.now();
        const rsaSig = await crypto.subtle.sign(
          { name: "RSA-PSS", saltLength: 32 },
          rsaPair.privateKey,
          data
        );
        rsaSign.push(performance.now() - t);

        t = performance.now();
        await crypto.subtle.verify(
          { name: "RSA-PSS", saltLength: 32 },
          rsaPair.publicKey,
          rsaSig,
          data
        );
        rsaVerify.push(performance.now() - t);

        // ECC Benchmark (ECDSA)
        t = performance.now();
        const eccPair = await crypto.subtle.generateKey(
          { name: "ECDSA", namedCurve: eccCurve },
          true,
          ["sign", "verify"]
        );
        eccKg.push(performance.now() - t);

        t = performance.now();
        const eccSig = await crypto.subtle.sign(
          { name: "ECDSA", hash: "SHA-256" },
          eccPair.privateKey,
          data
        );
        eccSign.push(performance.now() - t);

        t = performance.now();
        await crypto.subtle.verify(
          { name: "ECDSA", hash: "SHA-256" },
          eccPair.publicKey,
          eccSig,
          data
        );
        eccVerify.push(performance.now() - t);

        // Allow UI to refresh between iterations
        if (i % 2 === 0) await new Promise((r) => setTimeout(r, 10));
      }

      const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

      setSigBenchData([
        {
          name: "Key Generation",
          RSA: +avg(rsaKg).toFixed(3),
          ECC: +avg(eccKg).toFixed(3)
        },
        {
          name: "Signing",
          RSA: +avg(rsaSign).toFixed(3),
          ECC: +avg(eccSign).toFixed(3)
        },
        {
          name: "Verification",
          RSA: +avg(rsaVerify).toFixed(3),
          ECC: +avg(eccVerify).toFixed(3)
        }
      ]);

      setStatus("✅ Signature Benchmark completed successfully.");
      if (maxCompletedStep < 3) setMaxCompletedStep(3);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Benchmark failed: ${e.message}`);
    } finally {
      setSigBenchRunning(false);
    }
  };

  // Step 4 & 5: Encryption Benchmark (30 runs)
  const runEncryptionBenchmark = async () => {
    if (!inputBuffer) {
      setStatus("No input found — please add text or a file on the home page first.");
      return;
    }
    if (!keys) {
      setStatus("Please generate keys first.");
      return;
    }

    setEncBenchRunning(true);
    setStatus("Running 30 encryption benchmarks...");
    setEncBenchRaw([]);
    setEncBenchAvg([]);

    try {
      let rsaTimes = [];
      let eccTimes = [];

      for (let run = 0; run < 30; run++) {
        // RSA run
        const t0 = performance.now();
        const aesKeyRsa = await crypto.subtle.generateKey(
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
        const aesRawRsa = await crypto.subtle.exportKey("raw", aesKeyRsa);
        await crypto.subtle.encrypt(
          { name: "RSA-OAEP" },
          keys.rsaOaep.publicKey,
          aesRawRsa
        );
        const ivRsa = crypto.getRandomValues(new Uint8Array(12));
        await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: ivRsa },
          aesKeyRsa,
          inputBuffer
        );
        rsaTimes.push(performance.now() - t0);

        // ECC run
        const t1 = performance.now();
        const ephemeralKeyPair = await crypto.subtle.generateKey(
          { name: "ECDH", namedCurve: eccCurve },
          true,
          ["deriveKey"]
        );
        const sharedKeyEcc = await crypto.subtle.deriveKey(
          { name: "ECDH", public: keys.eccEcdh.publicKey },
          ephemeralKeyPair.privateKey,
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
        const ivEcc = crypto.getRandomValues(new Uint8Array(12));
        await crypto.subtle.encrypt(
          { name: "AES-GCM", iv: ivEcc },
          sharedKeyEcc,
          inputBuffer
        );
        eccTimes.push(performance.now() - t1);

        if (run % 3 === 0) await new Promise((r) => setTimeout(r, 10));
      }

      const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

      setEncBenchAvg([
        {
          name: "Encryption (Avg of 30 Runs)",
          RSA: +avg(rsaTimes).toFixed(3),
          ECC: +avg(eccTimes).toFixed(3)
        }
      ]);

      const rawRuns = rsaTimes.map((rTime, idx) => ({
        run: idx + 1,
        RSA: +rTime.toFixed(3),
        ECC: +eccTimes[idx].toFixed(3)
      }));

      setEncBenchRaw(rawRuns);
      setStatus("✅ Encryption benchmark completed.");
      if (maxCompletedStep < 5) setMaxCompletedStep(5);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Benchmark failed: ${e.message}`);
    } finally {
      setEncBenchRunning(false);
    }
  };

  // Step 6: Decryption
  const runDecryption = async () => {
    if (!encryptionResults) {
      setStatus("Please encrypt the file in Step 2 first.");
      return;
    }
    if (!keys) {
      setStatus("Please generate keys first.");
      return;
    }

    setDecrypting(true);
    setStatus("Decrypting file with RSA and ECC private keys...");
    setDecryptionResults(null);

    try {
      // 1. RSA Decrypt
      const rsaStart = performance.now();
      const rsaPacked = encryptionResults.rsa;
      const rsaView = new DataView(rsaPacked.buffer);
      const wkLen = rsaView.getUint32(0);
      const wrappedKeyRsa = rsaPacked.slice(4, 4 + wkLen);
      const ivRsa = rsaPacked.slice(4 + wkLen, 4 + wkLen + 12);
      const ciphertextRsa = rsaPacked.slice(4 + wkLen + 12);

      const decryptedAesRaw = await crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        keys.rsaOaep.privateKey,
        wrappedKeyRsa
      );
      const aesKeyRsa = await crypto.subtle.importKey(
        "raw",
        decryptedAesRaw,
        "AES-GCM",
        false,
        ["decrypt"]
      );
      const decryptedBufferRsa = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivRsa },
        aesKeyRsa,
        ciphertextRsa
      );
      const rsaTime = performance.now() - rsaStart;

      // 2. ECC Decrypt (ECIES)
      const eccStart = performance.now();
      const eccPacked = encryptionResults.ecc;
      const eccView = new DataView(eccPacked.buffer);
      const ephemPubLen = eccView.getUint32(0);
      const ephemPubRaw = eccPacked.slice(4, 4 + ephemPubLen);
      const ivEcc = eccPacked.slice(4 + ephemPubLen, 4 + ephemPubLen + 12);
      const ciphertextEcc = eccPacked.slice(4 + ephemPubLen + 12);

      const ephemeralPublicKey = await crypto.subtle.importKey(
        "raw",
        ephemPubRaw,
        { name: "ECDH", namedCurve: eccCurve },
        true,
        []
      );

      const sharedKeyEcc = await crypto.subtle.deriveKey(
        { name: "ECDH", public: ephemeralPublicKey },
        keys.eccEcdh.privateKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      const decryptedBufferEcc = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivEcc },
        sharedKeyEcc,
        ciphertextEcc
      );
      const eccTime = performance.now() - eccStart;

      setDecryptionResults({
        rsa: decryptedBufferRsa,
        ecc: decryptedBufferEcc,
        rsaText: new TextDecoder().decode(decryptedBufferRsa),
        eccText: new TextDecoder().decode(decryptedBufferEcc),
        times: { rsa: rsaTime, ecc: eccTime }
      });
      setStatus("✅ File decrypted successfully with both algorithms.");
      if (maxCompletedStep < 6) setMaxCompletedStep(6);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Decryption failed: ${e.message}. Did you generate new keys?`);
    } finally {
      setDecrypting(false);
    }
  };

  // Step 7 & 8: Decryption Benchmark (30 runs)
  const runDecryptionBenchmark = async () => {
    if (!encryptionResults) {
      setStatus("Please encrypt the file in Step 2 first.");
      return;
    }
    if (!keys) {
      setStatus("Please generate keys first.");
      return;
    }

    setDecBenchRunning(true);
    setStatus("Running 30 decryption benchmarks...");
    setDecBenchRaw([]);
    setDecBenchAvg([]);

    try {
      const rsaPacked = encryptionResults.rsa;
      const eccPacked = encryptionResults.ecc;

      let rsaTimes = [];
      let eccTimes = [];

      for (let run = 0; run < 30; run++) {
        // RSA run
        const t0 = performance.now();
        const rsaView = new DataView(rsaPacked.buffer);
        const wkLen = rsaView.getUint32(0);
        const wrappedKeyRsa = rsaPacked.slice(4, 4 + wkLen);
        const ivRsa = rsaPacked.slice(4 + wkLen, 4 + wkLen + 12);
        const ciphertextRsa = rsaPacked.slice(4 + wkLen + 12);

        const decryptedAesRaw = await crypto.subtle.decrypt(
          { name: "RSA-OAEP" },
          keys.rsaOaep.privateKey,
          wrappedKeyRsa
        );
        const aesKeyRsa = await crypto.subtle.importKey(
          "raw",
          decryptedAesRaw,
          "AES-GCM",
          false,
          ["decrypt"]
        );
        await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: ivRsa },
          aesKeyRsa,
          ciphertextRsa
        );
        rsaTimes.push(performance.now() - t0);

        // ECC run
        const t1 = performance.now();
        const eccView = new DataView(eccPacked.buffer);
        const ephemPubLen = eccView.getUint32(0);
        const ephemPubRaw = eccPacked.slice(4, 4 + ephemPubLen);
        const ivEcc = eccPacked.slice(4 + ephemPubLen, 4 + ephemPubLen + 12);
        const ciphertextEcc = eccPacked.slice(4 + ephemPubLen + 12);

        const ephemeralPublicKey = await crypto.subtle.importKey(
          "raw",
          ephemPubRaw,
          { name: "ECDH", namedCurve: eccCurve },
          true,
          []
        );
        const sharedKeyEcc = await crypto.subtle.deriveKey(
          { name: "ECDH", public: ephemeralPublicKey },
          keys.eccEcdh.privateKey,
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );
        await crypto.subtle.decrypt(
          { name: "AES-GCM", iv: ivEcc },
          sharedKeyEcc,
          ciphertextEcc
        );
        eccTimes.push(performance.now() - t1);

        if (run % 3 === 0) await new Promise((r) => setTimeout(r, 10));
      }

      const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

      setDecBenchAvg([
        {
          name: "Decryption (Avg of 30 Runs)",
          RSA: +avg(rsaTimes).toFixed(3),
          ECC: +avg(eccTimes).toFixed(3)
        }
      ]);

      const rawRuns = rsaTimes.map((rTime, idx) => ({
        run: idx + 1,
        RSA: +rTime.toFixed(3),
        ECC: +eccTimes[idx].toFixed(3)
      }));

      setDecBenchRaw(rawRuns);
      setStatus("✅ Decryption benchmark completed.");
      if (maxCompletedStep < 8) setMaxCompletedStep(8);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Benchmark failed: ${e.message}`);
    } finally {
      setDecBenchRunning(false);
    }
  };

  const isStepCompleted = (stepId) => {
    if (stepId === 1) return !!keys;
    if (stepId === 2) return !!encryptionResults;
    if (stepId === 3) return sigBenchData && sigBenchData.length > 0;
    if (stepId === 4) return encBenchRaw && encBenchRaw.length > 0;
    if (stepId === 5) return encBenchRaw && encBenchRaw.length > 0;
    if (stepId === 6) return !!decryptionResults;
    if (stepId === 7) return decBenchRaw && decBenchRaw.length > 0;
    if (stepId === 8) return decBenchRaw && decBenchRaw.length > 0;
    if (stepId === 9) return !!aiReport || maxCompletedStep >= 9;
    return false;
  };

  const isStepAccessible = (stepId) => {
    if (stepId === 1) return true;
    if (stepId === 2) return !!keys && !!inputBuffer;
    if (stepId === 3) return !!encryptionResults;
    if (stepId === 4) return sigBenchData && sigBenchData.length > 0;
    if (stepId === 5) return encBenchRaw && encBenchRaw.length > 0;
    if (stepId === 6) return encBenchRaw && encBenchRaw.length > 0;
    if (stepId === 7) return !!decryptionResults;
    if (stepId === 8) return decBenchRaw && decBenchRaw.length > 0;
    if (stepId === 9) return decBenchRaw && decBenchRaw.length > 0;
    return false;
  };

  const getStepStatusClass = (stepId) => {
    if (activeStep === stepId) return "bg-cyan-500 text-slate-900 border-cyan-400 font-bold scale-105 shadow-lg shadow-cyan-500/20";
    if (isStepCompleted(stepId)) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/60 cursor-pointer hover:bg-emerald-500/30";
    if (isStepAccessible(stepId)) return "bg-slate-800/80 text-slate-300 border-slate-700 cursor-pointer hover:bg-slate-800 hover:border-slate-600";
    return "bg-slate-900/40 text-slate-600 border-slate-800/80 cursor-not-allowed";
  };

  // No input reached the wizard — send the person back to the home page
  // where key size and input are actually configured.
  if (!inputBuffer) {
    return (
      <div className="max-w-lg mx-auto text-center bg-gradient-to-br from-slate-900/90 to-slate-800/70 border border-slate-800 rounded-3xl p-10 mt-6 shadow-2xl animate-fadeIn">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-5">
          <AlertCircle className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Setup needed first</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          This wizard needs a key size and an input (text or file), both chosen on the home page.
          Head back there to configure them — it only takes a few seconds.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/20"
        >
          ← Go to Home & Configure
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ConfigBar
        rsaBits={rsaBits}
        eccCurve={eccCurve}
        uploadedFile={uploadedFile}
        inputText={inputText}
      />

      <div className="grid lg:grid-cols-4 gap-6 items-start">
        <Sidebar
          STEPS={STEPS}
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          isStepCompleted={isStepCompleted}
          isStepAccessible={isStepAccessible}
          getStepStatusClass={getStepStatusClass}
        />

        {/* RIGHT MAIN PANEL (Interactive Wizard Container) */}
        <div className="lg:col-span-3 bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl relative min-h-[500px] flex flex-col justify-between overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

          {/* Dynamic Step Content Rendering */}
          <div className="relative z-10 flex-1">
            {/* Active Step Badge & Label */}
            <div className="flex items-center gap-2.5 mb-6 border-b border-slate-800 pb-4">
              <span className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md">
                Step {activeStep} of {TOTAL_STEPS}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {STEPS[activeStep - 1].label}
              </h2>
            </div>

            {activeStep === 1 && (
              <Step1
                rsaBits={rsaBits}
                eccCurve={eccCurve}
                keygenRunning={keygenRunning}
                generateKeys={generateKeys}
                keys={keys}
                showKeys={showKeys}
                setShowKeys={setShowKeys}
                keyTimes={keyTimes}
              />
            )}

            {activeStep === 2 && (
              <Step2
                encrypting={encrypting}
                runEncryption={runEncryption}
                inputBuffer={inputBuffer}
                encryptionResults={encryptionResults}
                uploadedFile={uploadedFile}
                downloadBlob={downloadBlob}
              />
            )}

            {activeStep === 3 && (
              <Step3
                sigBenchRunning={sigBenchRunning}
                runSigBenchmark={runSigBenchmark}
                sigBenchData={sigBenchData}
                rsaBits={rsaBits}
                eccCurve={eccCurve}
              />
            )}

            {activeStep === 4 && (
              <Step4
                encBenchRunning={encBenchRunning}
                inputBuffer={inputBuffer}
                runEncryptionBenchmark={runEncryptionBenchmark}
                encBenchAvg={encBenchAvg}
                rsaBits={rsaBits}
                eccCurve={eccCurve}
              />
            )}

            {activeStep === 5 && (
              <Step5
                encBenchRaw={encBenchRaw}
                rsaBits={rsaBits}
                eccCurve={eccCurve}
              />
            )}

            {activeStep === 6 && (
              <Step6
                decrypting={decrypting}
                encryptionResults={encryptionResults}
                runDecryption={runDecryption}
                decryptionResults={decryptionResults}
                uploadedFile={uploadedFile}
                downloadBlob={downloadBlob}
              />
            )}

            {activeStep === 7 && (
              <Step7
                decBenchRunning={decBenchRunning}
                encryptionResults={encryptionResults}
                runDecryptionBenchmark={runDecryptionBenchmark}
                decBenchAvg={decBenchAvg}
                rsaBits={rsaBits}
                eccCurve={eccCurve}
              />
            )}

            {activeStep === 8 && (
              <Step8
                decBenchRaw={decBenchRaw}
                rsaBits={rsaBits}
                eccCurve={eccCurve}
              />
            )}

            {activeStep === 9 && (
              <Step9
                rsaBits={rsaBits}
                keyConfig={keyConfig}
                keyTimes={keyTimes}
                encBenchAvg={encBenchAvg}
                decBenchAvg={decBenchAvg}
                sigBenchData={sigBenchData}
              />
            )}
          </div>

          <BottomNav
            activeStep={activeStep}
            totalSteps={TOTAL_STEPS}
            status={status}
            isStepCompleted={isStepCompleted}
            setActiveStep={setActiveStep}
            onReset={() => {
              setActiveStep(1);
              setMaxCompletedStep(1);
              setKeys(null);
              setKeyTimes(null);
              setEncryptionResults(null);
              setDecryptionResults(null);
              setSigBenchData([]);
              setEncBenchAvg([]);
              setEncBenchRaw([]);
              setDecBenchAvg([]);
              setDecBenchRaw([]);
              setAiReport("");
              setStatus("Session reset. Generate new keys to start again, or head to the home page for a fresh input.");
            }}
          />
        </div>
      </div>
    </div>
  );
}