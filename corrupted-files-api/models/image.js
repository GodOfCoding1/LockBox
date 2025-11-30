import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  hash: {
    type: Buffer,
    required: false,
  },
  isEncrypted: {
    type: Boolean,
    default: true,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: false,
  },
  fileExtension: {
    type: String,
    required: false,
  },
  fileName: {
    type: String,
    required: false,
  },
  createdAt: { type: Date, default: Date.now() },
});
const Image = mongoose.model("corrupted-image", ImageSchema);
export default Image;
