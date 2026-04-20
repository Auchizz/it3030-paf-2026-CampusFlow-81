const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Ticket owner is required"],
    },
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Ticket description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Ticket category is required"],
      trim: true,
    },
    priority: {
      type: String,
      required: [true, "Ticket priority is required"],
      enum: {
        values: ["LOW", "MEDIUM", "HIGH"],
        message: "Priority must be LOW, MEDIUM, or HIGH",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"],
        message: "Status must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED",
      },
      default: "OPEN",
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);
