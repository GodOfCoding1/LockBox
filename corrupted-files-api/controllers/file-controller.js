import { CORRUPTED_FOLDER } from "../constants.js";
import { deleteRaw, uploadRaw } from "../helpers/cloudinary.js";
import { decryptRawBuffer, encryptRawBuffer } from "../helpers/encryption.js";
import { authError } from "../helpers/request-errors.js";
import File from "../models/file.js";
import User from "../models/user.js";

export const allFiles = async (id) => {
  return await File.find({ user_id: id });
};

export const getFileById = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File Not Found",
      });
    }
    return res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Error Getting file ${req.params.id}: ${error.message}`,
    });
  }
};

export const addFile = async (req, res) => {
  let pId;
  try {
    if (!req.isAuthenticated()) return authError(res);
    if (!req.file) throw new Error("no file attached");
    const user = await User.findById(req.user.id);
    const pubKeyBuffer = await fetch(user.public_key_url);
    const encryptedInfo = encryptRawBuffer(
      req.file.buffer,
      Buffer.from(await pubKeyBuffer.arrayBuffer())
    );
    const result = await uploadRaw(CORRUPTED_FOLDER, encryptedInfo.buffer);
    if (result.public_id) pId = result.public_id;
    await File.create({
      user_id: req.user.id,
      public_id: result.public_id,
      url: result.secure_url,
      hash: encryptedInfo.encryptedHash,
      name: req.file.originalname,
      mimetype: req.file.mimetype,
    });
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
        error: `Error Adding file: ${error.message}`,
      });
    }
  }
};

export const deleteFileById = async (req, res) => {
  if (!req.isAuthenticated()) return authError(res);
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });
    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File Not Found",
      });
    }
    await deleteRaw(file.public_id);
    await file.remove();
    return res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: `Error Deleting File: ${error.message}`,
    });
  }
};

export const getFilesCount = async (user_id) =>
  (await File.find({ user_id })).length;

export const getNumberOfFiles = async (req, res) => {
  if (!req.isAuthenticated()) return authError(res);
  try {
    const count = await getFilesCount(req.user.id);
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

export const getFileIds = async (req, res) => {
  if (!req.isAuthenticated()) return authError(res);
  try {
    const ids = (await File.find({ user_id: req.user.id }, ["_id"])).map(
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

export const getDecodedFileById = async (req, res) => {
  if (!req.isAuthenticated()) return authError(res);
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });
    if (!file) {
      return res.status(404).json({
        success: false,
        error: "File Not Found",
      });
    }
    const user = await User.findById(req.user.id);
    const encryptedPrivateKey = await fetch(user.encrypted_private_key_url);
    const fileBufferRes = await fetch(file.url);
    const fileBuffer = await decryptRawBuffer(
      Buffer.from(await fileBufferRes.arrayBuffer()),
      Buffer.from(await encryptedPrivateKey.arrayBuffer()),
      file.hash,
      req.params.password
    );
    res.writeHead(200, {
      "Content-Disposition": `attachment; filename="${file.name}"`,
      "Content-Type": file.mimetype,
    });
    return res.end(fileBuffer);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: `Error decoding: ${error.message}`,
    });
  }
};
