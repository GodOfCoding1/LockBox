import { CORRUPTED_FOLDER } from "../constants.js";
import { deleteRaw, uploadRaw } from "../helpers/cloudinary.js";
import { decryptRawBuffer, encryptRawBuffer } from "../helpers/encryption.js";
import { authError } from "../helpers/request-errors.js";
import Image from "../models/image.js";
import User from "../models/user.js";

export const allImages = async (id) => {
  return await Image.find({ user_id: id });
};

export const getImageById = async (req, res, next) => {
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
    const user = await User.findById(req.user.id);
    //encrypt and upload image
    const pubKeyBuffer = await fetch(user.public_key_url);
    const encryptedInfo = encryptRawBuffer(
      req.file.buffer,
      Buffer.from(await pubKeyBuffer.arrayBuffer())
    );
    const result = await uploadRaw(CORRUPTED_FOLDER, encryptedInfo.buffer);
    if (result.public_id) pId = result.public_id;
    await Image.create({
      user_id: req.user.id,
      public_id: result.public_id,
      url: result.secure_url,
      hash: encryptedInfo.encryptedHash,
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
    const user = await User.findById(req.user.id);
    const encryptedPrivateKey = await fetch(user.encrypted_private_key_url);
    const imageBufferRes = await fetch(image.url);
    const imageBuffer = await decryptRawBuffer(
      Buffer.from(await imageBufferRes.arrayBuffer()),
      Buffer.from(await encryptedPrivateKey.arrayBuffer()),
      image.hash,
      req.params.password
    );
    const fileName = req.params.id + ".jpeg";
    res.writeHead(200, {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "image/jpeg",
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
