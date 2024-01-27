import mongoose from "mongoose";
import * as bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
  },
  master_password: {
    type: String,
    required: true,
  },
  createdAt: { type: Date, default: Date.now() },
});
userSchema.pre("save", async function (next) {
  try {
    // check method of registration
    const user = this;
    if (user.isModified("password")) {
      // generate salt
      const salt = await bcrypt.genSalt(10);
      // hash the password
      const hashedPassword = await bcrypt.hash(this.password, salt);
      // replace plain text password with hashed password
      this.password = hashedPassword;
    }
    if (user.isModified("master_password")) {
      // generate salt
      const saltForMaster = await bcrypt.genSalt(10);
      // hash the password
      // replace plain text password with hashed password
      this.master_password = await bcrypt.hash(
        this.master_password,
        saltForMaster
      );
    }
    next();
  } catch (error) {
    return next(error);
  }
});
userSchema.methods.matchPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw new Error(error);
  }
};
userSchema.methods.filteredJson = function () {
  return ["username", "_id"].reduce(
    (prev, cur) => ({ ...prev, [cur]: this[cur] }),
    {}
  );
};
const User = mongoose.model("user", userSchema);
export default User;
