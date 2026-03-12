const Room = require("../../models/room.model");
const Ward = require("../../models/ward.model");
const ApiError = require("../../errors/ApiError");
const { logAction } = require("../../utils/auditLogger");


exports.createRoom = async (data, userId) => {

  if (!data.wardId) {
    throw new ApiError(400, "Ward is required for room creation");
  }

  const ward = await Ward.findOne({
    _id: data.wardId,
    isDeleted: false
  });

  if (!ward) {
    throw new ApiError(404, "Ward not found");
  }

  const room = await Room.create({
    ...data,
    createdBy: userId
  });

  await logAction(
    userId,
    "CREATE_ROOM",
    "Room",
    room._id
  );

  return room;
};


exports.getRooms = async (wardId, hospitalId) => {

  if (wardId) {
    return Room.find({
      wardId,
      isDeleted: false
    }).sort({ createdAt: -1 });
  }

  if (hospitalId) {
    const wards = await Ward.find({ 
      hospitalId,
      isDeleted: false
    });
    const wardIds = wards.map(w => w._id);
    return Room.find({
      wardId: { $in: wardIds },
      isDeleted: false
    }).sort({ createdAt: -1 });
  }

  throw new ApiError(400, "Ward ID or Hospital ID required");

};


exports.updateRoom = async (id, data, userId) => {

  const room = await Room.findOne({
    _id: id,
    isDeleted: false
  });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const updatedRoom = await Room.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );

  await logAction(
    userId,
    "UPDATE_ROOM",
    "Room",
    id
  );

  return updatedRoom;
};


exports.deleteRoom = async (id, userId) => {

  const room = await Room.findOne({
    _id: id,
    isDeleted: false
  });

  if (!room) {
    throw new ApiError(404, "Room not found");
  }

  const deletedRoom = await Room.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );

  await logAction(
    userId,
    "DELETE_ROOM",
    "Room",
    id
  );

  return deletedRoom;
};
