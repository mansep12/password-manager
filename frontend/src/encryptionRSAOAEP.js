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

export async function encryptData(publicKey, plaintext) {
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

export async function decryptData(privateKey, ciphertext) {
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

