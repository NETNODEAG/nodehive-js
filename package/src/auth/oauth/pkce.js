function base64UrlEncode(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = (typeof btoa === "function"
    ? btoa(binary)
    : Buffer.from(binary, "binary").toString("base64"));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function getCryptoSubtle() {
  const cryptoObj =
    (typeof globalThis !== "undefined" && globalThis.crypto) ||
    (typeof window !== "undefined" && window.crypto);
  if (!cryptoObj?.subtle) {
    throw new Error(
      "Web Crypto API not available — PKCE requires crypto.subtle (Node >= 16 or modern browser)"
    );
  }
  return cryptoObj;
}

function getRandomBytes(length) {
  const cryptoObj = getCryptoSubtle();
  const bytes = new Uint8Array(length);
  cryptoObj.getRandomValues(bytes);
  return bytes;
}

export async function generatePKCE() {
  const verifierBytes = getRandomBytes(32);
  const codeVerifier = base64UrlEncode(verifierBytes);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await getCryptoSubtle().subtle.digest("SHA-256", data);
  const codeChallenge = base64UrlEncode(new Uint8Array(digest));

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: "S256",
  };
}

export function generateState() {
  return base64UrlEncode(getRandomBytes(32));
}
