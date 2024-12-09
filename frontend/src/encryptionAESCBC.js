export async function deriveKeyAESCBC(password, salt) {
  const passwordBuffer = new TextEncoder().encode(password);

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-CBC",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  return derivedKey;
}

export async function encryptAESCBC(plaintext, key) {
  const iv = crypto.getRandomValues(new Uint8Array(16)); // Generate a random IV
  const plaintextBuffer = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    plaintextBuffer
  );

  return { ciphertext: new Uint8Array(ciphertext), iv: iv };
}

export async function decryptAESCBC(ciphertext, key, iv) {
  const plaintextBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    ciphertext
  );

  return new TextDecoder().decode(plaintextBuffer);
}

export function arrayBufferToHex(uint8Array) {
  return uint8Array.reduce((acc, byte) => acc + byte.toString(16).padStart(2, "0"), "");
}

export function hexToArrayBuffer(hex) {
  const uint8Array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < uint8Array.length; i++) {
    uint8Array[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return uint8Array.buffer;
}

export default { deriveKeyAESCBC, encryptAESCBC, decryptAESCBC }
