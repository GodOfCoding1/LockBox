import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "image",
  },
  url: {
    type: String,
    required: true,
  },
  hash: {
    type: Buffer,
    required: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now() },
});
const Image = mongoose.model("corrupted-image", ImageSchema);
export default Image;
