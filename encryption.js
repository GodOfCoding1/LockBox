import * as crypto from "crypto";
import * as fs from "fs";

const algorithm = "aes-256-ctr";
const privateKeyPath = "keys/private.pem";
const publicKeyPath = "keys/public.pem";
const AESKeyPath = "keys/public.key";
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
  fs.writeFileSync("keys/public.pem", publicKey);
  fs.writeFileSync("keys/private.pem", privateKey);
  console.log("loaded keys to pem file in keys folder");
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

const aesDecrypt = (encrypted, key) => {
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

const encryptPrivateKey = async (password) => {
  //encrypts generated local private key with aes
  const key = generateAesKey(password);
  const fileBuffer = await fs.promises.readFile(privateKeyPath);
  const encryptedBuffer = aesEncrypt(fileBuffer, key);
  fs.writeFileSync(privateKeyPath, encryptedBuffer);
};

const decryptPrivateKey = async (password) => {
  const key = generateAesKey(password);
  const fileBuffer = await fs.promises.readFile(privateKeyPath);
  const privateKey = aesDecrypt(fileBuffer, key).toString("utf8");
  return privateKey; //returns text of decrypted private key
};

const encryptWithPublicKey = (buffer) => {
  const publicKey = fs.readFileSync(publicKeyPath, "utf8");
  return crypto.publicEncrypt(publicKey, buffer); //returns buffer
};

const decryptBufferWithPrivateKey = async (buffer, password) => {
  const privateKey = await decryptPrivateKey(password);
  return crypto.privateDecrypt(privateKey, buffer); //returns buffer
};

const imagePath = "sample.jpeg";
const encryptImageBuffer = (imagePath) => {
  const password = generateRandomPassword();
  fs.writeFileSync("sampleData/aes.key", encryptWithPublicKey(password));
  return aesEncrypt(fs.readFileSync(imagePath), generateAesKey(password));
};
const decryptImage = async (imagePath, password) => {
  const encryptedPasswordBuffer = await fs.promises.readFile(
    "sampleData/aes.key"
  );
  const passwordOfImage = await decryptBufferWithPrivateKey(
    encryptedPasswordBuffer,
    password
  );
  await fs.promises.writeFile(
    imagePath,
    aesDecrypt(fs.readFileSync(imagePath), generateAesKey(passwordOfImage))
  );
  console.log("image decoded!");
};
// encryptImage(imagePath);
// decryptImage(imagePath, "");
import * as cloudinary from "cloudinary";
import * as streamifier from "streamifier";

cloudinary.v2.config({
  cloud_name: "hibyehibye",
  api_key: "433544711529411",
  api_secret: "d7QnLYuJ0BfYA-WuAwrxrrO2hLk",
  secure: true,
});

const uploadImage = (buffer) => {
  const cld_upload_stream = cloudinary.v2.uploader.upload_stream(
    {
      folder: "corrupted-images",
      resource_type: "raw",
    },
    function (error, result) {
      console.log(error, result);
    }
  );
  streamifier.createReadStream(buffer).pipe(cld_upload_stream);
};
const fetchAllImages = async () => {
  const res = await cloudinary.v2.search
    .expression(
      "folder:corrupted-images/*" // add your folder
    )
    .sort_by("public_id")
    .execute();
  return res.resources.map((v) => ({ name: v.public_id, url: v.secure_url }));
};
const downloadAllImages = (imageUrls) => {
  imageUrls.forEach(async (image) => {
    const res = await fetch(image.url);
    const imagePath = `sampleData/${image.name}.jpeg`;
    await fs.promises.writeFile(
      imagePath,
      Buffer.from(await res.arrayBuffer())
    );
    decryptImage(imagePath, "@01");
  });
};
// uploadImage(encryptImageBuffer("sampleData/sample.jpeg"));
const run = async () => {
  const images = await fetchAllImages();
  downloadAllImages(images);
};
run();
