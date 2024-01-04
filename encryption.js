import crypto from "crypto";
const encryptionAlgoName = "AES-GCM";
const encryptionAlgo = {
  name: encryptionAlgoName,
  iv: window.crypto.getRandomValues(new Uint8Array(12)), // 96-bit
};

// create a 256-bit AES encryption key
const encryptionKey = await crypto.subtle.importKey(
  "raw",
  new Uint32Array([1, 2, 3, 4, 5, 6, 7, 8]),
  { name: encryptionAlgoName },
  true,
  ["encrypt", "decrypt"]
);
