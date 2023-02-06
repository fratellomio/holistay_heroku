const router = require('express').Router();

const { paymentMethodControllers } = require('../../controllers');

router.get(
  '/api/payment/paymentMethod/:paymentMethodId',
  paymentMethodControllers.getPaymentMethod
);

module.exports = router;
