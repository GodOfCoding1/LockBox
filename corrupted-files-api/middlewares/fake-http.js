import * as crypto from "crypto";
import * as fs from "fs";
import { aesDecrypt } from "../helpers/encryption";

export const decryptRequest = async (req, res, next) => {
  try {
    const { encryptedHash, encryptedData } = req.body;
    if (!encryptedData || !encryptedHash)
      return res.status(400).json({
        success: false,
        error: `need both data and hash`,
      });
    const privateKeyBuffer = await fs.promises.readFile(privateKeyPath);
    const hash = crypto.privateDecrypt(privateKeyBuffer, encryptedHash);
    req.body = JSON.parse(aesDecrypt(encryptedData, hash).toString());
    console.log(req.body);
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: `Error in network: ${error.message}`,
    });
  }
};
