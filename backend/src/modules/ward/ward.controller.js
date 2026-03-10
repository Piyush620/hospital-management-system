const wardService = require("./ward.service");


exports.createWard = async (req, res, next) => {
  try {

    const ward = await wardService.createWard(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      ward
    });

  } catch (err) {
    next(err);
  }
};


exports.getWards = async (req, res, next) => {
  try {

    const { hospitalId } = req.query;

    const wards = await wardService.getWards(hospitalId);

    res.json({
      success: true,
      wards
    });

  } catch (err) {
    next(err);
  }
};


exports.updateWard = async (req, res, next) => {
  try {

    const ward = await wardService.updateWard(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      ward
    });

  } catch (err) {
    next(err);
  }
};


exports.deleteWard = async (req, res, next) => {
  try {

    await wardService.deleteWard(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: "Ward deleted"
    });

  } catch (err) {
    next(err);
  }
};