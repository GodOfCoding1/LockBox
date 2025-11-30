import { CORRUPTED_FOLDER } from "../constants.js";
import { deleteRaw, uploadRaw } from "../helpers/cloudinary.js";
import { decryptRawBuffer, encryptRawBuffer } from "../helpers/encryption.js";
import { authError } from "../helpers/request-errors.js";
import Image from "../models/image.js";
import User from "../models/user.js";

// Helper function to extract file extension from mimeType or originalname
const getFileExtension = (mimeType, originalname) => {
  // Map common mime types to extensions
  const mimeToExt = {
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/aac": "aac",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "application/pdf": "pdf",
  };
  
  // Try mimeType first
  if (mimeType && mimeToExt[mimeType]) {
    return mimeToExt[mimeType];
  }
  
  // Fallback to extracting from originalname
  if (originalname) {
    const parts = originalname.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
  }
  
  // Default fallback
  return "bin";
};

export const allImages = async (id) => {
  return await Image.find({ user_id: id });
};

export const getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({
        success: false,
        error: "image Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: image,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Error Getting image ${req.params.id}: ${error.message}`,
    });
  }
};

export const addImage = async (req, res) => {
  let pId;
  try {
    if (!req.isAuthenticated()) return authError(res);
    if (!req.file) throw new Error("no file attached");
    
    // Check if encryption should be applied (default to true for backward compatibility)
    // Support both body and query parameters
    const encryptParam = req.body.encrypt !== undefined ? req.body.encrypt : req.query.encrypt;
    const shouldEncrypt = encryptParam !== "false" && encryptParam !== false;
    
    let uploadBuffer;
    let encryptedHash = null;
    
    if (shouldEncrypt) {
      const user = await User.findById(req.user.id);
      //encrypt and upload image
      const pubKeyBuffer = await fetch(user.public_key_url);
      const encryptedInfo = encryptRawBuffer(
        req.file.buffer,
        Buffer.from(await pubKeyBuffer.arrayBuffer())
      );
      uploadBuffer = encryptedInfo.buffer;
      encryptedHash = encryptedInfo.encryptedHash;
    } else {
      // Upload file without encryption
      uploadBuffer = req.file.buffer;
    }
    
    const result = await uploadRaw(CORRUPTED_FOLDER, uploadBuffer);
    if (result.public_id) pId = result.public_id;
    
    // Detect file type information
    const mimeType = req.file.mimetype || "application/octet-stream";
    const fileExtension = getFileExtension(req.file.mimetype, req.file.originalname);
    
    await Image.create({
      user_id: req.user.id,
      public_id: result.public_id,
      url: result.secure_url,
      hash: encryptedHash,
      isEncrypted: shouldEncrypt,
      mimeType: mimeType,
      fileExtension: fileExtension,
      fileName: req.body.fileName || req.file.originalname.replace(/\.[^/.]+$/, ''), // Store original name without extension
    });
    console.log("file anem:", req.body.fileName || req.file.originalname.replace(/\.[^/.]+$/, ''));
    return res.status(201).json({
      success: true,
      data: { url: result.secure_url },
    });
  } catch (error) {
    console.log(error);
    if (pId) deleteRaw(pId);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map((val) => val.message),
      });
    } else {
      return res.status(500).json({
        success: false,
        error: `Error Adding image: ${error.message}`,
      });
    }
  }
};

export const deleteImageById = async (req, res) => {
  if (!req.isAuthenticated()) return authError(res);
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });
    if (!image) {
      return res.status(404).json({
        success: false,
        error: "Image Not Found",
      });
    }
    await deleteRaw(image.public_id);
    await image.remove();
    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: `Error Deleting Image: ${error.message}`,
    });
  }
};

export const getImagesCount = async (user_id) =>
  (await Image.find({ user_id })).length;

export const getNumberOfImages = async (req, res) => {
  if (!req.isAuthenticated()) return authError(res);
  try {
    const count = await getImagesCount(req.user.id);
    return res.status(201).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: `Error counting: ${error.message}`,
    });
  }
};

export const getImageIds = async (req, res) => {
  if (!req.isAuthenticated()) return authError(res);
  try {
    const ids = (await Image.find({ user_id: req.user.id }, ["_id"])).map(
      (v) => v._id
    );
    return res.status(201).json({
      success: true,
      data: { ids },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: `Error getting ids: ${error.message}`,
    });
  }
};

export const getDecodedImageById = async (req, res) => {
  if (!req.isAuthenticated()) return authError(res);
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });
    if (!image) {
      return res.status(404).json({
        success: false,
        error: "Image Not Found",
      });
    }
    
    let imageBuffer;
    
    if (image.isEncrypted) {
      // Decrypt the file if it's encrypted
      const user = await User.findById(req.user.id);
      const encryptedPrivateKey = await fetch(user.encrypted_private_key_url);
      const imageBufferRes = await fetch(image.url);
      imageBuffer = await decryptRawBuffer(
        Buffer.from(await imageBufferRes.arrayBuffer()),
        Buffer.from(await encryptedPrivateKey.arrayBuffer()),
        image.hash,
        req.params.password
      );
    } else {
      // Return the file directly if it's not encrypted
      const imageBufferRes = await fetch(image.url);
      imageBuffer = Buffer.from(await imageBufferRes.arrayBuffer());
    }
    
    // Use stored file type information, with fallback for backward compatibility
    const fileExtension = image.fileExtension || "jpeg";
    const mimeType = image.mimeType || "image/jpeg";
    const fileName = req.params.id + "." + fileExtension;
    
    res.writeHead(200, {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": mimeType,
    });
    return res.end(imageBuffer);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: `Error decoding: ${error.message}`,
    });
  }
};
