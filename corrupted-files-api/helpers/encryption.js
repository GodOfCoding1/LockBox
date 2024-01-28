import * as crypto from "crypto";

const algorithm = "aes-256-ctr";
const PADDING = 16;

const generateLocalKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });
  return { publicKey, privateKey };
};
const encryptPrivateKey = (password, buffer) => {
  //encrypts generated local private key with aes
  const key = generateAesKey(password);
  return aesEncrypt(buffer, key);
};
export const generateUserKeys = (masterPass) => {
  const keys = generateLocalKeyPair();
  return {
    publicKey: keys.publicKey,
    encryptedPrivateKey: encryptPrivateKey(masterPass, keys.privateKey),
  };
};

const generateAesKey = (pass) =>
  crypto.createHash("sha256").update(pass).digest("base64").substr(0, 32);

const generateRandomPassword = () => crypto.randomBytes(20).toString("hex");

const aesEncrypt = (buffer, key) => {
  // Create an initialization vector
  const iv = crypto.randomBytes(PADDING);
  // Create a new cipher using the algorithm, key, and iv
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  // Create the new (encrypted) buffer
  const result = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
  return result;
};

export const aesDecrypt = (encrypted, key) => {
  // Get the iv: the first 16 bytes
  const iv = encrypted.slice(0, PADDING);
  // Get the rest
  encrypted = encrypted.slice(PADDING);
  // Create a decipher
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  // Actually decrypt it
  const result = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return result;
};

const decryptPrivateKey = async (password, encryptedPrivateKeyBuffer) => {
  const key = generateAesKey(password);
  const privateKey = aesDecrypt(encryptedPrivateKeyBuffer, key).toString(
    "utf8"
  );
  if (privateKey) return privateKey; //returns text of decrypted private key
  throw new Error("error in decoding private key");
};

const decryptBufferWithPrivateKey = async (
  buffer,
  password,
  encryptedPrivateKeyBuffer
) => {
  try {
    const privateKey = await decryptPrivateKey(
      password,
      encryptedPrivateKeyBuffer
    );
    return crypto.privateDecrypt(privateKey, buffer); //returns buffer
  } catch (error) {
    console.log(error);
  }
};

export const encryptRawBuffer = (buffer, pubKeyBuffer) => {
  const password = generateRandomPassword();
  return {
    buffer: aesEncrypt(buffer, generateAesKey(password)),
    encryptedHash: crypto.publicEncrypt(pubKeyBuffer, password),
  };
};

export const decryptRawBuffer = async (
  buffer,
  encryptedPrivateKeyBuffer,
  encryptedHash,
  password
) => {
  const passwordOfImage = await decryptBufferWithPrivateKey(
    encryptedHash,
    password,
    encryptedPrivateKeyBuffer
  );
  return aesDecrypt(buffer, generateAesKey(passwordOfImage));
};
