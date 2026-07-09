export function ab2b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
export function downloadBlob(data, name) {
  const url = URL.createObjectURL(new Blob([data]));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
export async function deriveKey(password, salt) {
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



export const RSA_KEY_SIZES = [1024, 2048, 3072];
export const ECC_CURVES    = ["P-256", "P-384"];

export const ALGO_META = {
  RSA: {
    1024: { note: "Legacy — not recommended for new systems" },
    2048: { note: "Current standard — widely used" },
    3072: { note: "High security — future-proof" },
  },
  ECC: {
    "P-256": { note: "Standard curve — used in TLS, Apple, Google" },
    "P-384": { note: "High security — used in NSA Suite B" },
  },
};

