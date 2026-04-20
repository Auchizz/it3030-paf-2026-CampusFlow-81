const crypto = require("crypto");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    passwordSalt: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["USER", "ADMIN"],
        message: "Role must be USER or ADMIN",
      },
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.setPassword = function setPassword(password) {
  this.passwordSalt = crypto.randomBytes(16).toString("hex");
  this.passwordHash = crypto.pbkdf2Sync(password, this.passwordSalt, 100000, 64, "sha512").toString("hex");
};

userSchema.methods.comparePassword = function comparePassword(password) {
  const candidateHash = crypto.pbkdf2Sync(password, this.passwordSalt, 100000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(candidateHash, "hex"), Buffer.from(this.passwordHash, "hex"));
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    _id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);
