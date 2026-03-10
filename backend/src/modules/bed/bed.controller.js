const bedService = require("./bed.service");


exports.createBed = async (req, res, next) => {
  try {

    const bed = await bedService.createBed(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      bed
    });

  } catch (err) {
    next(err);
  }
};


exports.getBeds = async (req, res, next) => {
  try {

    const { hospitalId } = req.query;

    const beds = await bedService.getBeds(hospitalId);

    res.json({
      success: true,
      beds
    });

  } catch (err) {
    next(err);
  }
};


exports.updateBed = async (req, res, next) => {
  try {

    const bed = await bedService.updateBed(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      bed
    });

  } catch (err) {
    next(err);
  }
};


exports.deleteBed = async (req, res, next) => {
  try {

    await bedService.deleteBed(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: "Bed deleted"
    });

  } catch (err) {
    next(err);
  }
};