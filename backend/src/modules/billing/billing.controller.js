const billingService = require("./billing.service");


exports.createBill = async (req, res, next) => {
  try {

    const billing = await billingService.createBill(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      billing,
      bill: billing
    });

  } catch (err) {
    next(err);
  }
};


exports.getBills = async (req, res, next) => {
  try {

    const { hospitalId } = req.query;

    const bills = await billingService.getBills(hospitalId);

    res.json({
      success: true,
      bills
    });

  } catch (err) {
    next(err);
  }
};


exports.updateBill = async (req, res, next) => {
  try {

    const bill = await billingService.updateBill(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      bill
    });

  } catch (err) {
    next(err);
  }
};


exports.deleteBill = async (req, res, next) => {
  try {

    await billingService.deleteBill(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: "Bill deleted"
    });

  } catch (err) {
    next(err);
  }
};
