const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Resource name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Resource type is required"],
      enum: {
        values: ["LECTURE_HALL", "LAB", "EQUIPMENT"],
        message: "Type must be LECTURE_HALL, LAB, or EQUIPMENT",
      },
    },
    capacity: {
      type: Number,
      required: [true, "Resource capacity is required"],
      min: [0, "Capacity cannot be negative"],
    },
    location: {
      type: String,
      required: [true, "Resource location is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "OUT_OF_SERVICE"],
        message: "Status must be ACTIVE or OUT_OF_SERVICE",
      },
      default: "ACTIVE",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
