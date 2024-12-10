export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: "SHA-256" }
    },
    true,
    ["encrypt", "decrypt"]
  );

  return keyPair;
}

export async function encryptRSA(publicKey, plaintext) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(plaintext);

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encodedData
  );

  return ciphertext;
}

export async function decryptRSA(privateKey, ciphertext) {
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

export async function exportPublicKey(publicKey) {
  const exported = await window.crypto.subtle.exportKey('spki', publicKey);
  return exported;
}

export async function importPublicKey(keyBuffer) {
  return window.crypto.subtle.importKey(
    "spki",
    keyBuffer,
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" },
    },
    true,
    ["encrypt"]
  );
}

export async function exportPrivateKey(privateKey) {
  const exportedPrivateKey = await window.crypto.subtle.exportKey('pkcs8', privateKey);
  return exportedPrivateKey;
}

export async function importPrivateKey(privateKeyBuffer) {
  const privateKey = await window.crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' },
    },
    true,
    ['decrypt']
  );

  return privateKey;
}

export function arrayBufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0')) // Convert byte to hex and pad with 0
    .join(''); // Combine into a single string
}

export function hexToArrayBuffer(hexString) {
  const byteArray = new Uint8Array(
    hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)) // Split hex into pairs and convert to integers
  );
  return byteArray.buffer; // Convert Uint8Array to ArrayBuffer
}

export default { arrayBufferToHex, hexToArrayBuffer }
