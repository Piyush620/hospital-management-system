const paymentService = require("./payment.service");


exports.createPayment = async (req, res, next) => {
  try {

    const payment = await paymentService.createPayment(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      payment
    });

  } catch (err) {
    next(err);
  }
};


exports.getPayments = async (req, res, next) => {
  try {

    const { hospitalId } = req.query;

    const payments = await paymentService.getPayments(hospitalId);

    res.json({
      success: true,
      payments
    });

  } catch (err) {
    next(err);
  }
};


exports.updatePayment = async (req, res, next) => {
  try {

    const payment = await paymentService.updatePayment(
      req.params.id,
      req.body,
      req.user.id
    );

    res.json({
      success: true,
      payment
    });

  } catch (err) {
    next(err);
  }
};


exports.deletePayment = async (req, res, next) => {
  try {

    await paymentService.deletePayment(
      req.params.id,
      req.user.id
    );

    res.json({
      success: true,
      message: "Payment deleted"
    });

  } catch (err) {
    next(err);
  }
};