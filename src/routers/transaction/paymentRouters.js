const router = require('express').Router();
const verifyJWT = require('../../middlewares/verifyJWT');

const { paymentController } = require('../../controllers');

router.post(
  '/api/payment/:transactionId',
  verifyJWT,
  paymentController.addPayment
);
router.post(
  '/api/payment/:transactionId/verification',
  verifyJWT,
  paymentController.uploadPaymentProof
);
router.get('/api/payment/:paymentId', verifyJWT, paymentController.getPayment);

module.exports = router;
