const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const User = require("../models/User");

const withReadFlag = (notification, userId) => {
  const plain = notification.toObject();
  const read = plain.readBy.some((readerId) => readerId.toString() === userId.toString());

  return {
    ...plain,
    read,
    isRead: read,
  };
};

const getNotifications = async (req, res) => {
  try {
    const query =
      req.user.role === "ADMIN"
        ? {}
        : {
            $or: [{ recipientId: req.user._id }, { recipientId: null }],
          };

    const notifications = await Notification.find(query)
      .populate("recipientId", "fullName email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications.map((notification) => withReadFlag(notification, req.user._id)),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const createNotification = async (req, res) => {
  try {
    const { title, message, type = "GENERAL", recipientId = null } = req.body;
    const errors = [];

    if (!title || !title.trim()) {
      errors.push("Notification title is required");
    }

    if (!message || !message.trim()) {
      errors.push("Notification message is required");
    }

    if (recipientId && !mongoose.Types.ObjectId.isValid(recipientId)) {
      errors.push("Recipient ID is invalid");
    }

    if (errors.length) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    if (recipientId) {
      const recipientExists = await User.exists({ _id: recipientId });
      if (!recipientExists) {
        return res.status(404).json({ success: false, message: "Recipient user not found" });
      }
    }

    const notification = await Notification.create({
      title,
      message,
      type,
      recipientId: recipientId || null,
    });

    return res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: notification,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: Object.values(error.errors).map((validationError) => validationError.message),
      });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid notification ID" });
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (
      req.user.role !== "ADMIN" &&
      notification.recipientId &&
      notification.recipientId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "You cannot update this notification" });
    }

    await Notification.findByIdAndUpdate(id, { $addToSet: { readBy: req.user._id } });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const markAllRead = async (req, res) => {
  try {
    const query =
      req.user.role === "ADMIN"
        ? {}
        : {
            $or: [{ recipientId: req.user._id }, { recipientId: null }],
          };

    await Notification.updateMany(query, { $addToSet: { readBy: req.user._id } });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markRead,
  markAllRead,
};
