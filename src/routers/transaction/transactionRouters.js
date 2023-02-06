const router = require('express').Router();

const { transactionControllers } = require('../../controllers');

router.get(
  '/api/transaction/room/:roomId',
  transactionControllers.getTransactionByRoomId
);

router.get('/api/transaction/:id', transactionControllers.getTransactionById);

module.exports = router;
