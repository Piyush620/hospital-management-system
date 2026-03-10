const Bed = require("../../models/bed.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");


exports.createBed = async (data, userId) => {

  if (!data.roomId || !data.hospitalId) {
    throw new ApiError(400, "Room and Hospital are required for bed creation");
  }

  const bed = await Bed.create({
    ...data,
    createdBy: userId
  });

  await logAction(
    userId,
    "CREATE_BED",
    "Bed",
    bed._id
  );

  return bed;
};


exports.getBeds = async (hospitalId) => {

  if (!hospitalId) {
    throw new ApiError(400, "Hospital ID required");
  }

  return Bed
    .find({
      hospitalId,
      isDeleted: false
    })
    .populate("roomId")
    .sort({ createdAt: -1 });

};


exports.updateBed = async (id, data, userId) => {

  const bed = await Bed.findOne({
    _id: id,
    isDeleted: false
  });

  if (!bed) {
    throw new ApiError(404, "Bed not found");
  }

  const updatedBed = await Bed.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  await logAction(
    userId,
    "UPDATE_BED",
    "Bed",
    id
  );

  return updatedBed;
};


exports.deleteBed = async (id, userId) => {

  const bed = await Bed.findOne({
    _id: id,
    isDeleted: false
  });

  if (!bed) {
    throw new ApiError(404, "Bed not found");
  }

  const deletedBed = await Bed.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  await logAction(
    userId,
    "DELETE_BED",
    "Bed",
    id
  );

  return deletedBed;
};