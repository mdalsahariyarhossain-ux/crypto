import React, { useState, useRef, useEffect } from "react";
import {
  Shield,
  Key,
  Upload,
  Lock,
  Unlock,
  BarChart2,
  LineChart as LineIcon,
  Sparkles,
  Download,
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Helper functions for base64 and PEM conversions
function ab2b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
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

const STEPS = [
  { id: 1, label: "Select Key Size (RSA & ECC)", icon: Shield },
  { id: 2, label: "Key Generation of RSA and ECC", icon: Key },
  { id: 3, label: "Upload Input File (Text/File)", icon: Upload },
  { id: 4, label: "Encryption of File", icon: Lock },
  { id: 5, label: "Sig + Verify + KeyGen Graph", icon: BarChart2 },
  { id: 6, label: "Encryption Time Bar Graph", icon: BarChart2 },
  { id: 7, label: "Encryption Performance Chart", icon: LineIcon },
  { id: 8, label: "Decrypt the File", icon: Unlock },
  { id: 9, label: "Decryption Time Bar Graph", icon: BarChart2 },
  { id: 10, label: "Decryption Performance Chart", icon: LineIcon },
  { id: 11, label: "Overall Performance Summary", icon: Sparkles }
];

export default function WizardFlowPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState(1);

  // Step 1: Config
  const [keyConfig, setKeyConfig] = useState("A"); // "A": RSA-2048/P-256, "B": RSA-3072/P-384

  // Step 2: Keys
  const [keys, setKeys] = useState(null);
  const [keyTimes, setKeyTimes] = useState(null);
  const [showKeys, setShowKeys] = useState(false);
  const [keygenRunning, setKeygenRunning] = useState(false);

  // Step 3: Upload
  const [inputText, setInputText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputBuffer, setInputBuffer] = useState(null); // ArrayBuffer
  const fileInputRef = useRef(null);

  // Step 4: Encryption
  const [encryptionResults, setEncryptionResults] = useState(null);
  const [encrypting, setEncrypting] = useState(false);

  // Step 5: Sign/Verify Benchmark (20 runs)
  const [sigBenchData, setSigBenchData] = useState([]);
  const [sigBenchRunning, setSigBenchRunning] = useState(false);

  // Step 6: Encryption Benchmark (30 runs)
  const [encBenchAvg, setEncBenchAvg] = useState([]);
  const [encBenchRaw, setEncBenchRaw] = useState([]); // Raw 30 run times
  const [encBenchRunning, setEncBenchRunning] = useState(false);

  // Step 8: Decryption
  const [decryptionResults, setDecryptionResults] = useState(null);
  const [decrypting, setDecrypting] = useState(false);

  // Step 9: Decryption Benchmark (30 runs)
  const [decBenchAvg, setDecBenchAvg] = useState([]);
  const [decBenchRaw, setDecBenchRaw] = useState([]); // Raw 30 run times
  const [decBenchRunning, setDecBenchRunning] = useState(false);

  // Step 11: Summary & AI recommendation
  const [aiReport, setAiReport] = useState("");
  const [aiLoading, setAiLoading] = useState(false);


  // Status updates
  const [status, setStatus] = useState("");

  const rsaBits = keyConfig === "A" ? 2048 : 3072;
  const eccCurve = keyConfig === "A" ? "P-256" : "P-384";

  // Trigger scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeStep]);

  // Handle uploaded files
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setInputText("");
      const reader = new FileReader();
      reader.onload = () => {
        setInputBuffer(reader.result);
        setStatus(`Successfully loaded file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        if (maxCompletedStep < 3) setMaxCompletedStep(3);
      };
      reader.onerror = () => setStatus("Error reading file.");
      reader.readAsArrayBuffer(file);
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    setUploadedFile(null);
    if (val.trim()) {
      const enc = new TextEncoder();
      setInputBuffer(enc.encode(val).buffer);
      if (maxCompletedStep < 3) setMaxCompletedStep(3);
    } else {
      setInputBuffer(null);
    }
  };

  // Step 2: Key Generation
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
      if (maxCompletedStep < 2) setMaxCompletedStep(2);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Key generation failed: ${e.message}`);
    } finally {
      setKeygenRunning(false);
    }
  };

  // Step 4: Encryption
  const runEncryption = async () => {
    if (!inputBuffer) {
      setStatus("Please provide input text or upload a file first.");
      return;
    }
    if (!keys) {
      setStatus("Please generate keys in Step 2 first.");
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
      if (maxCompletedStep < 4) setMaxCompletedStep(4);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Encryption failed: ${e.message}`);
    } finally {
      setEncrypting(false);
    }
  };

  // Step 5: Digital Signature + Verification + KeyGen (20 runs)
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
      if (maxCompletedStep < 5) setMaxCompletedStep(5);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Benchmark failed: ${e.message}`);
    } finally {
      setSigBenchRunning(false);
    }
  };

  // Step 6 & 7: Encryption Benchmark (30 runs)
  const runEncryptionBenchmark = async () => {
    if (!inputBuffer) {
      setStatus("Please provide input text or upload a file first.");
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
      if (maxCompletedStep < 7) setMaxCompletedStep(7);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Benchmark failed: ${e.message}`);
    } finally {
      setEncBenchRunning(false);
    }
  };

  // Step 8: Decryption
  const runDecryption = async () => {
    if (!encryptionResults) {
      setStatus("Please encrypt the file in Step 4 first.");
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
      if (maxCompletedStep < 8) setMaxCompletedStep(8);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Decryption failed: ${e.message}. Did you generate new keys?`);
    } finally {
      setDecrypting(false);
    }
  };

  // Step 9 & 10: Decryption Benchmark (30 runs)
  const runDecryptionBenchmark = async () => {
    if (!encryptionResults) {
      setStatus("Please encrypt the file in Step 4 first.");
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
      if (maxCompletedStep < 10) setMaxCompletedStep(10);
    } catch (e) {
      console.error(e);
      setStatus(`❌ Benchmark failed: ${e.message}`);
    } finally {
      setDecBenchRunning(false);
    }
  };

  // Step 11: Ask AI Advisor for Recommendations
  const fetchAiReport = async () => {
    setAiLoading(true);
    setAiReport("");
    setStatus("Fetching AI security recommendation report...");

    try {
      const avg = (arr) => (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3);
      const rsaEncRaw = encBenchRaw.map((x) => x.RSA);
      const eccEncRaw = encBenchRaw.map((x) => x.ECC);
      const rsaDecRaw = decBenchRaw.map((x) => x.RSA);
      const eccDecRaw = decBenchRaw.map((x) => x.ECC);

      const rsaSigRaw = sigBenchData.find((x) => x.name === "Signing")?.RSA || 0;
      const eccSigRaw = sigBenchData.find((x) => x.name === "Signing")?.ECC || 0;
      const rsaVfRaw = sigBenchData.find((x) => x.name === "Verification")?.RSA || 0;
      const eccVfRaw = sigBenchData.find((x) => x.name === "Verification")?.ECC || 0;

      const statisticsMessage = `
        I have benchmarked RSA-${rsaBits} and ECC-${eccCurve} on my machine. Here are the metrics:
        - Key Generation (Avg): RSA = ${keyTimes?.rsa.toFixed(3)} ms, ECC = ${keyTimes?.ecc.toFixed(3)} ms
        - Digital Signing (20 runs Avg): RSA = ${rsaSigRaw} ms, ECC = ${eccSigRaw} ms
        - Signature Verification (20 runs Avg): RSA = ${rsaVfRaw} ms, ECC = ${eccVfRaw} ms
        - File Encryption (30 runs Avg): RSA = ${avg(rsaEncRaw)} ms, ECC = ${avg(eccEncRaw)} ms
        - File Decryption (30 runs Avg): RSA = ${avg(rsaDecRaw)} ms, ECC = ${avg(eccDecRaw)} ms
        - Key Size: RSA = ${rsaBits} bits, ECC = ${eccCurve} (${keyConfig === "A" ? 256 : 384} bits)
        Please write a customized report analyzing these exact run times, comparing key generation, digital signatures, hybrid encryption/decryption performance, memory/computational overhead, and a final algorithm choice recommendation based on the numbers. Keep it detailed but easy to read.
      `;

      const res = await fetch("http://localhost:4000/api/ai-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: statisticsMessage }]
        })
      });

      const data = await res.json();
      const text = data.content?.map((c) => c.text || "").join("") || "Could not generate AI report.";
      setAiReport(text);
      setStatus("✅ AI Report ready.");
      if (maxCompletedStep < 11) setMaxCompletedStep(11);
    } catch (e) {
      console.error(e);
      setAiReport("⚠️ Error connecting to local AI Advisor backend server on http://localhost:4000. Please start the node server in your workspace to receive custom AI reports.");
      setStatus("❌ AI Report connection error.");
    } finally {
      setAiLoading(false);
    }
  };

  const isStepCompleted = (stepId) => {
    if (stepId === 1) return true;
    if (stepId === 2) return !!keys;
    if (stepId === 3) return !!inputBuffer;
    if (stepId === 4) return !!encryptionResults;
    if (stepId === 5) return sigBenchData && sigBenchData.length > 0;
    if (stepId === 6) return encBenchRaw && encBenchRaw.length > 0;
    if (stepId === 7) return encBenchRaw && encBenchRaw.length > 0;
    if (stepId === 8) return !!decryptionResults;
    if (stepId === 9) return decBenchRaw && decBenchRaw.length > 0;
    if (stepId === 10) return decBenchRaw && decBenchRaw.length > 0;
    if (stepId === 11) return !!aiReport || maxCompletedStep >= 11;
    return false;
  };

  const isStepAccessible = (stepId) => {
    if (stepId === 1 || stepId === 2) return true;
    if (stepId === 3) return !!keys;
    if (stepId === 4) return !!keys && !!inputBuffer;
    if (stepId === 5) return !!encryptionResults;
    if (stepId === 6) return sigBenchData && sigBenchData.length > 0;
    if (stepId === 7) return encBenchRaw && encBenchRaw.length > 0;
    if (stepId === 8) return encBenchRaw && encBenchRaw.length > 0;
    if (stepId === 9) return !!decryptionResults;
    if (stepId === 10) return decBenchRaw && decBenchRaw.length > 0;
    if (stepId === 11) return decBenchRaw && decBenchRaw.length > 0;
    return false;
  };

  const getStepStatusClass = (stepId) => {
    if (activeStep === stepId) return "bg-cyan-500 text-slate-900 border-cyan-400 font-bold scale-105 shadow-lg shadow-cyan-500/20";
    if (isStepCompleted(stepId)) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/60 cursor-pointer hover:bg-emerald-500/30";
    if (isStepAccessible(stepId)) return "bg-slate-800/80 text-slate-300 border-slate-700 cursor-pointer hover:bg-slate-800 hover:border-slate-600";
    return "bg-slate-900/40 text-slate-600 border-slate-800/80 cursor-not-allowed";
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6 items-start">
      {/* LEFT NAVIGATION STEPPER (Desktop Timeline) */}
      <div className="lg:col-span-1 bg-gradient-to-br from-slate-900/90 to-slate-800/80 border border-slate-800/80 rounded-2xl p-4 sticky top-6 shadow-2xl backdrop-blur-md hidden lg:block animate-fadeIn">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">
          Flow Progress
        </h3>
        <div className="space-y-1">
          {STEPS.map((s) => {
            const IconComponent = s.icon;
            const isCompleted = isStepCompleted(s.id);
            const isActive = activeStep === s.id;
            return (
              <button
                key={s.id}
                disabled={!isStepAccessible(s.id)}
                onClick={() => setActiveStep(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${getStepStatusClass(
                  s.id
                )}`}
              >
                <div className={`p-1.5 rounded-lg border ${
                  isActive ? "bg-slate-900/40 border-cyan-300" : isCompleted ? "bg-emerald-950/20 border-emerald-400" : "bg-slate-950 border-slate-800"
                }`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold leading-tight truncate">
                    {s.id}. {s.label}
                  </p>
                  <p className="text-[9px] text-slate-400/80 leading-none mt-0.5">
                    {isActive ? "In Progress" : isCompleted ? "Completed" : "Locked"}
                  </p>
                </div>
                {isCompleted && !isActive && (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MOBILE TIMELINE ACCORDION (Visible on Mobile/Tablet) */}
      <div className="lg:hidden bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex overflow-x-auto gap-2 scrollbar-thin">
        {STEPS.map((s) => {
          const isCompleted = isStepCompleted(s.id);
          const isActive = activeStep === s.id;
          return (
            <button
              key={s.id}
              disabled={!isStepAccessible(s.id)}
              onClick={() => setActiveStep(s.id)}
              className={`flex-none flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all ${
                isActive
                  ? "bg-cyan-500 text-slate-900 border-cyan-400 font-semibold"
                  : isCompleted
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : isStepAccessible(s.id)
                  ? "bg-slate-800/80 text-slate-300 border-slate-700/60"
                  : "bg-slate-900/40 text-slate-600 border-slate-800/80"
              }`}
            >
              <span>{s.id}</span>
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>


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
              Step {activeStep} of 11
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {STEPS[activeStep - 1].label}
            </h2>
          </div>

          {/* STEP 1: Select Key Size */}
          {activeStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                To run an authentic comparison between RSA and ECC, choose key sizes representing equivalent cryptographic security strengths:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Standard Config */}
                <button
                  onClick={() => {
                    setKeyConfig("A");
                    setKeys(null);
                    if (maxCompletedStep >= 2) setMaxCompletedStep(1);
                  }}
                  className={`group relative flex flex-col items-start text-left border rounded-2xl p-5 transition-all duration-300 ${
                    keyConfig === "A"
                      ? "bg-slate-800/80 border-cyan-400 shadow-xl shadow-cyan-500/5"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase mb-1">
                    Option A (Standard Strength)
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 group-hover:text-cyan-300 transition">
                    RSA-2048 ↔ ECC-P256
                  </h4>
                  <div className="mt-3 space-y-1 text-xs text-slate-400">
                    <p>• <strong>Equivalence</strong>: ~112-bit symmetric security level</p>
                    <p>• <strong>RSA key length</strong>: 2048 bits (Commonly used)</p>
                    <p>• <strong>ECC key length</strong>: 256 bits (Ultra-short, lightweight)</p>
                  </div>
                  {keyConfig === "A" && (
                    <span className="absolute top-4 right-4 bg-cyan-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded">
                      SELECTED
                    </span>
                  )}
                </button>

                {/* Advanced Config */}
                <button
                  onClick={() => {
                    setKeyConfig("B");
                    setKeys(null);
                    if (maxCompletedStep >= 2) setMaxCompletedStep(1);
                  }}
                  className={`group relative flex flex-col items-start text-left border rounded-2xl p-5 transition-all duration-300 ${
                    keyConfig === "B"
                      ? "bg-slate-800/80 border-purple-400 shadow-xl shadow-purple-500/5"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase mb-1">
                    Option B (High Strength)
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 group-hover:text-purple-300 transition">
                    RSA-3072 ↔ ECC-P384
                  </h4>
                  <div className="mt-3 space-y-1 text-xs text-slate-400">
                    <p>• <strong>Equivalence</strong>: ~128-bit symmetric security level (NSA Suite B)</p>
                    <p>• <strong>RSA key length</strong>: 3072 bits (Future standard)</p>
                    <p>• <strong>ECC key length</strong>: 384 bits (Extremely secure)</p>
                  </div>
                  {keyConfig === "B" && (
                    <span className="absolute top-4 right-4 bg-purple-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded">
                      SELECTED
                    </span>
                  )}
                </button>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  ECC requires far smaller key lengths than RSA for equivalent security. For example, a 256-bit ECC key yields equal protection to a 2048-bit RSA key, leading to shorter certificates, faster network handshakes, and reduced power usage.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: Key Generation */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                Generate key pairs locally in your browser. This will produce encryption key pairs (RSA-OAEP, ECDH) and signing key pairs (RSA-PSS, ECDSA).
              </p>

              <div className="flex gap-4">
                <button
                  disabled={keygenRunning}
                  onClick={generateKeys}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-900 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${keygenRunning ? "animate-spin" : ""}`} />
                  {keygenRunning ? "Generating..." : "Generate RSA & ECC Keys"}
                </button>
                {keys && (
                  <button
                    onClick={() => setShowKeys(!showKeys)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-600 bg-slate-800/40 text-slate-200 hover:border-cyan-400/50 hover:text-cyan-400 transition"
                  >
                    <FileText className="w-4 h-4" />
                    {showKeys ? "Hide Public/Private Keys" : "Reveal Public/Private Keys"}
                  </button>
                )}
              </div>

              {keyTimes && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-cyan-400">{keyTimes.rsa.toFixed(2)} ms</p>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">RSA KeyGen Time</p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-emerald-400">{keyTimes.ecc.toFixed(2)} ms</p>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">ECC KeyGen Time</p>
                  </div>
                </div>
              )}

              {keys && showKeys && (
                <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin text-[10px] bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-slate-300">
                  <div>
                    <p className="text-xs font-bold text-cyan-300 mb-2">RSA Public Key (OAEP)</p>
                    <pre className="whitespace-pre-wrap break-all bg-slate-950 p-2.5 rounded border border-slate-800">{keys.rsaPEM.public}</pre>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold text-cyan-300 mb-2">RSA Private Key (OAEP)</p>
                    <pre className="whitespace-pre-wrap break-all bg-slate-950 p-2.5 rounded border border-slate-800">{keys.rsaPEM.private}</pre>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold text-emerald-300 mb-2">ECC Public Key (ECDH)</p>
                    <pre className="whitespace-pre-wrap break-all bg-slate-950 p-2.5 rounded border border-slate-800">{keys.eccPEM.public}</pre>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-bold text-emerald-300 mb-2">ECC Private Key (ECDH)</p>
                    <pre className="whitespace-pre-wrap break-all bg-slate-950 p-2.5 rounded border border-slate-800">{keys.eccPEM.private}</pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Upload Input File */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                Upload a file (e.g. a document, PDF, or image) OR type raw text to benchmark encryption and decryption speed.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* File Upload Box */}
                <div
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    uploadedFile ? "border-cyan-400 bg-cyan-950/5" : "border-slate-800 hover:border-cyan-400/50 hover:bg-slate-900/40"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="text-4xl mb-3">📂</div>
                  {uploadedFile ? (
                    <div>
                      <p className="font-semibold text-slate-200 truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{(uploadedFile.size / 1024).toFixed(2)} KB · Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-slate-300 text-xs">Click to upload or drop file here</p>
                      <p className="text-[10px] text-slate-500 mt-1.5">Supports any file type. Everything runs in-browser.</p>
                    </div>
                  )}
                </div>

                {/* Text Area Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                    OR Type Raw Text Message
                  </label>
                  <textarea
                    rows={5}
                    value={inputText}
                    onChange={handleTextChange}
                    placeholder="Enter plaintext message here..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs focus:outline-none focus:border-cyan-500 text-slate-200"
                  />
                </div>
              </div>

              {inputBuffer && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">Payload buffer initialized:</span>
                  </div>
                  <strong className="text-cyan-400 font-mono">{inputBuffer.byteLength} Bytes</strong>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Encryption of File */}
          {activeStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                Encrypt the uploaded file using the generated RSA and ECC key pairs. Download buttons will be available for each encrypted output.
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
                      <h4 className="text-xs font-bold text-slate-300 mb-2">RSA Encrypted File</h4>
                      <p className="text-2xl font-black text-cyan-400">{encryptionResults.times.rsa.toFixed(2)} ms</p>
                      <p className="text-[10px] text-slate-500">RSA-OAEP + AES-256-GCM</p>
                      <button
                        onClick={() => downloadBlob(encryptionResults.rsa, (uploadedFile ? uploadedFile.name : "text") + "_rsa.enc")}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 text-[10px] font-bold text-slate-200 hover:border-cyan-400 hover:text-cyan-400 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Encrypted File
                      </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-slate-300 mb-2">ECC Encrypted File</h4>
                      <p className="text-2xl font-black text-emerald-400">{encryptionResults.times.ecc.toFixed(2)} ms</p>
                      <p className="text-[10px] text-slate-500">ECIES (ECDH) + AES-256-GCM</p>
                      <button
                        onClick={() => downloadBlob(encryptionResults.ecc, (uploadedFile ? uploadedFile.name : "text") + "_ecc.enc")}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 text-[10px] font-bold text-slate-200 hover:border-emerald-400 hover:text-emerald-400 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Encrypted File
                      </button>
                    </div>
                  </div>

                  <details className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-[10px]">
                    <summary className="cursor-pointer font-bold text-slate-400">View Ciphertext Snippets (Base64)</summary>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-bold text-cyan-300 mb-1">RSA Output:</p>
                        <pre className="whitespace-pre-wrap break-all bg-slate-950 p-2 border border-slate-800/60 max-h-36 overflow-y-auto text-slate-400 leading-tight">{encryptionResults.rsaB64.slice(0, 1000)}...</pre>
                      </div>
                      <div>
                        <p className="font-bold text-emerald-300 mb-1">ECC ECIES Output:</p>
                        <pre className="whitespace-pre-wrap break-all bg-slate-950 p-2 border border-slate-800/60 max-h-36 overflow-y-auto text-slate-400 leading-tight">{encryptionResults.eccB64.slice(0, 1000)}...</pre>
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Digital Signature + Verification + KeyGen (20 runs) */}
          {activeStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                Execute key generation, digital signing, and signature verification 20 times to measure processing times accurately under RSA and ECC.
              </p>

              <button
                disabled={sigBenchRunning}
                onClick={runSigBenchmark}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-950 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {sigBenchRunning ? "Benchmarking (20x)..." : "Run Signature Benchmark"}
              </button>

              {sigBenchData.length > 0 && (
                <div className="space-y-4">
                  <div className="h-72 bg-slate-900 border border-slate-800/80 rounded-2xl p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sigBenchData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: 'Execution Time (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10, offset: 0 }} />
                        <ChartTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px" }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="RSA" fill="#38bdf8" radius={[4, 4, 0, 0]} name={`RSA-${rsaBits}`} />
                        <Bar dataKey="ECC" fill="#22c55e" radius={[4, 4, 0, 0]} name={`ECC-${eccCurve}`} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                    <h5 className="font-bold text-slate-300">Analysis Summary:</h5>
                    <ul className="list-disc ml-5 text-slate-400 space-y-1">
                      <li><strong>Key Gen</strong>: ECC keys are generated orders of magnitude faster due to simple group operations.</li>
                      <li><strong>Signing</strong>: ECC signatures (ECDSA) are highly efficient and faster than RSA.</li>
                      <li><strong>Verification</strong>: RSA verification can be very fast, but overall ECC maintains low overhead.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Encryption Benchmark (30 runs) */}
          {activeStep === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                Run encryption 30 times using RSA-OAEP + AES-GCM and ECC ECIES + AES-GCM to establish consistency and compute reliable averages.
              </p>

              <button
                disabled={encBenchRunning || !inputBuffer}
                onClick={runEncryptionBenchmark}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-950 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {encBenchRunning ? "Benchmarking (30x)..." : "Run Encryption Benchmark"}
              </button>

              {encBenchAvg.length > 0 && (
                <div className="space-y-4">
                  <div className="h-60 bg-slate-900 border border-slate-800/80 rounded-2xl p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={encBenchAvg} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: 'Average Time (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                        <ChartTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px" }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="RSA" fill="#38bdf8" radius={[4, 4, 0, 0]} name={`RSA-${rsaBits}`} />
                        <Bar dataKey="ECC" fill="#22c55e" radius={[4, 4, 0, 0]} name={`ECC-${eccCurve}`} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <p className="text-xl font-black text-cyan-400">{encBenchAvg[0].RSA.toFixed(3)} ms</p>
                      <p className="text-[9px] uppercase font-bold text-slate-500 mt-1">RSA Average Encryption Time</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <p className="text-xl font-black text-emerald-400">{encBenchAvg[0].ECC.toFixed(3)} ms</p>
                      <p className="text-[9px] uppercase font-bold text-slate-500 mt-1">ECC Average Encryption Time</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: Performance Graph Chart of Both RSA and ECC for Encryption */}
          {activeStep === 7 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                Visualize run-by-run processing times across the 30 encryption benchmarks. This highlights stability, cache impacts, and consistent performance differences.
              </p>

              {encBenchRaw.length > 0 ? (
                <div className="h-72 bg-slate-900 border border-slate-800/80 rounded-2xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={encBenchRaw} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="run" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} />
                      <ChartTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px" }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="RSA" stroke="#38bdf8" strokeWidth={2.5} name={`RSA-${rsaBits}`} dot={{ r: 2.5 }} />
                      <Line type="monotone" dataKey="ECC" stroke="#22c55e" strokeWidth={2.5} name={`ECC-${eccCurve}`} dot={{ r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-12 text-center text-slate-500">
                  Please run the benchmark in Step 6 first to generate data.
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Decrypt the File */}
          {activeStep === 8 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                Decrypt the ciphertext payloads back to original plaintext using private keys.
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
                      <h4 className="text-xs font-bold text-slate-300 mb-2">RSA Decrypted File</h4>
                      <p className="text-2xl font-black text-cyan-400">{decryptionResults.times.rsa.toFixed(2)} ms</p>
                      <p className="text-[10px] text-slate-500">Unwrap + AES-GCM Decrypt</p>
                      <button
                        onClick={() => downloadBlob(decryptionResults.rsa, (uploadedFile ? uploadedFile.name : "decrypted_text.txt"))}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 text-[10px] font-bold text-slate-200 hover:border-cyan-400 hover:text-cyan-400 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Decrypted File
                      </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-slate-300 mb-2">ECC Decrypted File</h4>
                      <p className="text-2xl font-black text-emerald-400">{decryptionResults.times.ecc.toFixed(2)} ms</p>
                      <p className="text-[10px] text-slate-500">ECDH Derivation + AES-GCM Decrypt</p>
                      <button
                        onClick={() => downloadBlob(decryptionResults.ecc, (uploadedFile ? uploadedFile.name : "decrypted_text.txt"))}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/40 text-[10px] font-bold text-slate-200 hover:border-emerald-400 hover:text-emerald-400 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Decrypted File
                      </button>
                    </div>
                  </div>

                  {!uploadedFile && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-slate-300 mb-2">Decrypted Message Snippet:</h4>
                      <p className="text-sm font-semibold text-slate-100">{decryptionResults.rsaText}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 9: Decryption Time Bar Graph (30 Times) */}
          {activeStep === 9 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                Run decryption 30 times using RSA and ECC (ECIES) private keys to evaluate performance consistency and calculate accurate averages.
              </p>

              <button
                disabled={decBenchRunning || !encryptionResults}
                onClick={runDecryptionBenchmark}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-950 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                {decBenchRunning ? "Benchmarking (30x)..." : "Run Decryption Benchmark"}
              </button>

              {decBenchAvg.length > 0 && (
                <div className="space-y-4">
                  <div className="h-60 bg-slate-900 border border-slate-800/80 rounded-2xl p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={decBenchAvg} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} label={{ value: 'Average Time (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                        <ChartTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px" }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="RSA" fill="#38bdf8" radius={[4, 4, 0, 0]} name={`RSA-${rsaBits}`} />
                        <Bar dataKey="ECC" fill="#22c55e" radius={[4, 4, 0, 0]} name={`ECC-${eccCurve}`} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <p className="text-xl font-black text-cyan-400">{decBenchAvg[0].RSA.toFixed(3)} ms</p>
                      <p className="text-[9px] uppercase font-bold text-slate-500 mt-1">RSA Average Decryption Time</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <p className="text-xl font-black text-emerald-400">{decBenchAvg[0].ECC.toFixed(3)} ms</p>
                      <p className="text-[9px] uppercase font-bold text-slate-500 mt-1">ECC Average Decryption Time</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 10: Performance Graph Chart of Both RSA and ECC for Decryption */}
          {activeStep === 10 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                Visualize run-by-run processing times across the 30 decryption benchmarks. This highlights consistency, performance jitter, and overall decryption overhead.
              </p>

              {decBenchRaw.length > 0 ? (
                <div className="h-72 bg-slate-900 border border-slate-800/80 rounded-2xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={decBenchRaw} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                      <XAxis dataKey="run" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 9 }} />
                      <ChartTooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "10px" }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="RSA" stroke="#38bdf8" strokeWidth={2.5} name={`RSA-${rsaBits}`} dot={{ r: 2.5 }} />
                      <Line type="monotone" dataKey="ECC" stroke="#22c55e" strokeWidth={2.5} name={`ECC-${eccCurve}`} dot={{ r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-850 rounded-2xl p-12 text-center text-slate-500">
                  Please run the benchmark in Step 9 first to generate data.
                </div>
              )}
            </div>
          )}

          {/* STEP 11: Overall Performance Summary */}
          {activeStep === 11 && (
            <div className="space-y-6 animate-fadeIn">
              <p className="text-sm text-slate-400">
                Review the consolidated cryptographic results and fetch AI recommendation report.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Stats Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Summary Statistics</h4>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="py-2 text-slate-400">Metric</th>
                        <th className="py-2 text-cyan-400 text-center">RSA-{rsaBits}</th>
                        <th className="py-2 text-emerald-400 text-center">ECC-{eccCurve}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr>
                        <td className="py-2 font-medium">Key Generation</td>
                        <td className="py-2 text-center">{keyTimes ? `${keyTimes.rsa.toFixed(2)} ms` : "N/A"}</td>
                        <td className="py-2 text-center">{keyTimes ? `${keyTimes.ecc.toFixed(2)} ms` : "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Avg Encryption (30 Runs)</td>
                        <td className="py-2 text-center">{encBenchAvg.length ? `${encBenchAvg[0].RSA.toFixed(3)} ms` : "N/A"}</td>
                        <td className="py-2 text-center">{encBenchAvg.length ? `${encBenchAvg[0].ECC.toFixed(3)} ms` : "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Avg Decryption (30 Runs)</td>
                        <td className="py-2 text-center">{decBenchAvg.length ? `${decBenchAvg[0].RSA.toFixed(3)} ms` : "N/A"}</td>
                        <td className="py-2 text-center">{decBenchAvg.length ? `${decBenchAvg[0].ECC.toFixed(3)} ms` : "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Avg Signature (20 Runs)</td>
                        <td className="py-2 text-center">{sigBenchData.find(x => x.name === "Signing") ? `${sigBenchData.find(x => x.name === "Signing").RSA.toFixed(3)} ms` : "N/A"}</td>
                        <td className="py-2 text-center">{sigBenchData.find(x => x.name === "Signing") ? `${sigBenchData.find(x => x.name === "Signing").ECC.toFixed(3)} ms` : "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Avg Verify (20 Runs)</td>
                        <td className="py-2 text-center">{sigBenchData.find(x => x.name === "Verification") ? `${sigBenchData.find(x => x.name === "Verification").RSA.toFixed(3)} ms` : "N/A"}</td>
                        <td className="py-2 text-center">{sigBenchData.find(x => x.name === "Verification") ? `${sigBenchData.find(x => x.name === "Verification").ECC.toFixed(3)} ms` : "N/A"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-medium">Equivalent Security Key Size</td>
                        <td className="py-2 text-center font-semibold text-cyan-400">{rsaBits} bits</td>
                        <td className="py-2 text-center font-semibold text-emerald-400">{keyConfig === "A" ? "256 bits" : "384 bits"} (88% smaller)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* AI report panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">AI Advisor Insight</h4>
                    <p className="text-[11px] text-slate-500 mb-4">Click below to generate a detailed report analyzing your benchmarks, computational overheads, and security considerations.</p>

                    {aiReport && (
                      <div className="text-xs leading-relaxed text-slate-300 max-h-56 overflow-y-auto scrollbar-thin whitespace-pre-wrap p-3 bg-slate-950 border border-slate-850 rounded-xl">
                        {aiReport}
                      </div>
                    )}
                  </div>

                  <button
                    disabled={aiLoading}
                    onClick={fetchAiReport}
                    className="mt-4 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95 bg-gradient-to-r from-purple-500 to-indigo-500 border-transparent text-white hover:from-purple-400 hover:to-indigo-400 disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${aiLoading ? "animate-spin" : ""}`} />
                    {aiLoading ? "Consulting AI..." : "Generate AI Recommendation Report"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION ACTIONS (Previous / Next Buttons) */}
        <div className="relative z-10 border-t border-slate-800 pt-4 mt-6 flex justify-between items-center">
          <button
            disabled={activeStep === 1}
            onClick={() => setActiveStep(activeStep - 1)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Real-time status toast inside main panel */}
          {status && (
            <span className="text-[10px] font-medium text-slate-500 text-center max-w-sm truncate hidden md:inline">
              {status}
            </span>
          )}

          {activeStep < 11 ? (
            <button
              disabled={!isStepCompleted(activeStep)}
              onClick={() => setActiveStep(activeStep + 1)}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl border transition-all bg-gradient-to-r from-cyan-500 to-teal-500 border-transparent text-slate-950 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveStep(1);
                setMaxCompletedStep(1);
                setKeys(null);
                setKeyTimes(null);
                setInputText("");
                setUploadedFile(null);
                setInputBuffer(null);
                setEncryptionResults(null);
                setDecryptionResults(null);
                setSigBenchData([]);
                setEncBenchAvg([]);
                setEncBenchRaw([]);
                setDecBenchAvg([]);
                setDecBenchRaw([]);
                setAiReport("");
                setStatus("Wizard reset. Ready to start new session.");
              }}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl border transition-all bg-gradient-to-r from-purple-500 to-pink-500 border-transparent text-white hover:from-purple-400 hover:to-pink-400"
            >
              Reset Session <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
