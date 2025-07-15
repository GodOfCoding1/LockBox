import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
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
  user_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now() },
});
const File = mongoose.model("corrupted-file", FileSchema);
export default File;
