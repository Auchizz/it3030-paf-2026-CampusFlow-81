const fs = require("fs/promises");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const Ticket = require("../models/Ticket");

const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const formatValidationErrors = (error) =>
  Object.values(error.errors).map((validationError) => validationError.message);

const sendControllerError = (res, error) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formatValidationErrors(error),
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${error.path}`,
    });
  }

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
};

const validateTicketInput = ({ title, description, category, priority, status }) => {
  const errors = [];

  if (!title || !title.trim()) {
    errors.push("Ticket title is required");
  }

  if (!description || !description.trim()) {
    errors.push("Ticket description is required");
  }

  if (!category || !category.trim()) {
    errors.push("Ticket category is required");
  }

  if (!priority) {
    errors.push("Ticket priority is required");
  } else if (!TICKET_PRIORITIES.includes(priority)) {
    errors.push("Priority must be LOW, MEDIUM, or HIGH");
  }

  if (status && !TICKET_STATUSES.includes(status)) {
    errors.push("Status must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED");
  }

  return errors;
};

const removeUploadedFile = async (file) => {
  if (!file) {
    return;
  }

  try {
    await fs.unlink(file.path);
  } catch (error) {
    console.error("Failed to remove uploaded file:", error.message);
  }
};

const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority, status } = req.body;
    const errors = validateTicketInput(req.body);

    if (errors.length > 0) {
      await removeUploadedFile(req.file);

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const imagePath = req.file ? `uploads/tickets/${req.file.filename}` : "";

    const ticket = await Ticket.create({
      userId: req.user._id,
      title,
      description,
      category,
      priority,
      status: status || "OPEN",
      image: imagePath,
    });

    await Notification.create({
      title: "Ticket created",
      message: `Your ticket "${title}" was created and is open.`,
      type: "TICKET",
      recipientId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    await removeUploadedFile(req.file);
    return sendControllerError(res, error);
  }
};

const getTickets = async (req, res) => {
  try {
    const query = req.user.role === "ADMIN" ? {} : { userId: req.user._id };
    const tickets = await Ticket.find(query)
      .populate("userId", "fullName email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!TICKET_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    await Notification.create({
      title: `Ticket ${status.toLowerCase()}`,
      message: `Ticket "${ticket.title}" was updated to ${status}.`,
      type: "TICKET",
      recipientId: ticket.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicketStatus,
};
