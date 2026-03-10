const roomService = require("./room.service");


exports.createRoom = async (req, res, next) => {
  try {

    const room = await roomService.createRoom(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      room
    });

  } catch (err) {
    next(err);
  }
};


exports.getRooms = async (req, res, next) => {
  try {

    const { wardId, hospitalId } = req.query;

    const rooms = await roomService.getRooms(wardId, hospitalId);

    res.json({
      success: true,
      rooms
    });

  } catch (err) {
    next(err);
  }
};


exports.updateRoom = async (req, res, next) => {
  try {

    const room = await roomService.updateRoom(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      room
    });

  } catch (err) {
    next(err);
  }
};


exports.deleteRoom = async (req, res, next) => {
  try {

    await roomService.deleteRoom(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: "Room deleted"
    });

  } catch (err) {
    next(err);
  }
};