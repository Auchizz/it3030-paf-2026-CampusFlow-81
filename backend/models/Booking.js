const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: [true, "Resource ID is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must use HH:mm format"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "End time must use HH:mm format"],
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "APPROVED", "REJECTED"],
        message: "Status must be PENDING, APPROVED, or REJECTED",
      },
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ resourceId: 1, date: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
