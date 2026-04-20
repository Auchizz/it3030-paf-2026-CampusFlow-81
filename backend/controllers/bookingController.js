const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const Resource = require("../models/Resource");

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const BOOKING_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const normalizeDate = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setUTCHours(0, 0, 0, 0);
  return date;
};

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

const validateBookingInput = ({ resourceId, date, startTime, endTime, status }) => {
  const errors = [];

  if (!resourceId) {
    errors.push("Resource ID is required");
  } else if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    errors.push("Invalid resource ID");
  }

  const bookingDate = normalizeDate(date);
  if (!date) {
    errors.push("Booking date is required");
  } else if (!bookingDate) {
    errors.push("Booking date is invalid");
  }

  if (!startTime) {
    errors.push("Start time is required");
  } else if (!TIME_PATTERN.test(startTime)) {
    errors.push("Start time must use HH:mm format");
  }

  if (!endTime) {
    errors.push("End time is required");
  } else if (!TIME_PATTERN.test(endTime)) {
    errors.push("End time must use HH:mm format");
  }

  if (TIME_PATTERN.test(startTime || "") && TIME_PATTERN.test(endTime || "")) {
    if (toMinutes(startTime) >= toMinutes(endTime)) {
      errors.push("Start time must be before end time");
    }
  }

  if (status && !BOOKING_STATUSES.includes(status)) {
    errors.push("Status must be PENDING, APPROVED, or REJECTED");
  }

  return {
    errors,
    bookingDate,
  };
};

const findConflictingBooking = ({ resourceId, date, startTime, endTime, excludeBookingId }) => {
  const query = {
    resourceId,
    date,
    status: { $ne: "REJECTED" },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return Booking.findOne(query);
};

const createBooking = async (req, res) => {
  try {
    const { resourceId, date, startTime, endTime, status } = req.body;
    const { errors, bookingDate } = validateBookingInput(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const resourceExists = await Resource.exists({ _id: resourceId });
    if (!resourceExists) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    if (status !== "REJECTED") {
      const conflictingBooking = await findConflictingBooking({
        resourceId,
        date: bookingDate,
        startTime,
        endTime,
      });

      if (conflictingBooking) {
        return res.status(409).json({
          success: false,
          message: "Resource is already booked for the selected time",
          conflict: conflictingBooking,
        });
      }
    }

    const booking = await Booking.create({
      resourceId,
      userId: req.user._id,
      date: bookingDate,
      startTime,
      endTime,
      status: status || "PENDING",
    });

    await Notification.create({
      title: "Booking request submitted",
      message: `Your booking request for ${startTime}-${endTime} is pending review.`,
      type: "BOOKING",
      recipientId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const getBookings = async (req, res) => {
  try {
    const query = req.user.role === "ADMIN" ? {} : { userId: req.user._id };
    const bookings = await Booking.find(query)
      .populate("resourceId", "name type location status")
      .populate("userId", "fullName email role")
      .sort({ date: 1, startTime: 1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be PENDING, APPROVED, or REJECTED",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (status !== "REJECTED") {
      const conflictingBooking = await findConflictingBooking({
        resourceId: booking.resourceId,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        excludeBookingId: booking._id,
      });

      if (conflictingBooking) {
        return res.status(409).json({
          success: false,
          message: "Cannot update status because this booking overlaps another active booking",
          conflict: conflictingBooking,
        });
      }
    }

    booking.status = status;
    await booking.save();

    await Notification.create({
      title: `Booking ${status.toLowerCase()}`,
      message: `Your booking for ${booking.startTime}-${booking.endTime} was ${status.toLowerCase()}.`,
      type: "BOOKING",
      recipientId: booking.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus,
};
