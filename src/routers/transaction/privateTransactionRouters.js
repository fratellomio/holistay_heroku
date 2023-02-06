const router = require('express').Router();
const verifyJWT = require('../../middlewares/verifyJWT');

const { privateTransactionControllers } = require('../../controllers');

router.post(
  '/api/transaction/',
  verifyJWT,
  privateTransactionControllers.addTransaction
);

router.get(
  '/api/trips/:userId',
  verifyJWT,
  privateTransactionControllers.getuserTransaction
);

module.exports = router;
