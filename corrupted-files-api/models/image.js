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
    required: true,
  },
  createdAt: { type: Date, default: Date.now() },
});
const Image = mongoose.model("corrupted-image", ImageSchema);
export default Image;
