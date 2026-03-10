const Ward = require("../../models/ward.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");


exports.createWard = async (data, userId) => {

  if (!data.hospitalId) {
    throw new ApiError(400, "Hospital is required for ward creation");
  }

  const ward = await Ward.create({
    ...data,
    createdBy: userId
  });

  await logAction(
    userId,
    "CREATE_WARD",
    "Ward",
    ward._id
  );

  return ward;
};


exports.getWards = async (hospitalId) => {

  return Ward.find({
    hospitalId,
    isDeleted: false
  }).sort({ createdAt: -1 });

};


exports.updateWard = async (id, data, userId) => {

  const ward = await Ward.findOne({
    _id: id,
    isDeleted: false
  });

  if (!ward) {
    throw new ApiError(404, "Ward not found");
  }

  const updatedWard = await Ward.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  await logAction(
    userId,
    "UPDATE_WARD",
    "Ward",
    id
  );

  return updatedWard;
};


exports.deleteWard = async (id, userId) => {

  const ward = await Ward.findOne({
    _id: id,
    isDeleted: false
  });

  if (!ward) {
    throw new ApiError(404, "Ward not found");
  }

  const deletedWard = await Ward.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  await logAction(
    userId,
    "DELETE_WARD",
    "Ward",
    id
  );

  return deletedWard;
};