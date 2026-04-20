const mongoose = require("mongoose");
const Resource = require("../models/Resource");

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

  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
};

const isValidResourceId = (id) => mongoose.Types.ObjectId.isValid(id);

const createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: resource,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const getResources = async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const updateResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidResourceId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID",
      });
    }

    const resource = await Resource.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: resource,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidResourceId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource ID",
      });
    }

    const resource = await Resource.findByIdAndDelete(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
      data: resource,
    });
  } catch (error) {
    return sendControllerError(res, error);
  }
};

module.exports = {
  createResource,
  getResources,
  updateResource,
  deleteResource,
};
