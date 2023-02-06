const router = require('express').Router();
const { tenantTransaction } = require('../controllers');
const verifyJWT = require('../middlewares/verifyJWT');

router.get(
  '/api/transactions/tenant/:tenantId',
  tenantTransaction.getTransaction
);
router.get(
  '/api/transactions/tenant/chart/:tenantId/:curentYear',
  tenantTransaction.getDataChart
);
router.get(
  '/api/transactions/tenant/:tenantId/total',
  tenantTransaction.getTotalTransaction
);
router.get(
  '/api/transactions/tenant/:tenantId/:status',
  tenantTransaction.transactionsUser
);

router.post(
  '/api/transactions/accept',
  verifyJWT,
  tenantTransaction.acceptTransaction
);
router.post(
  '/api/transactions/reject',
  verifyJWT,
  tenantTransaction.rejectTransaction
);
router.post(
  '/api/transactions/accept',
  verifyJWT,
  tenantTransaction.acceptTransaction
);
router.post(
  '/api/transactions/reject',
  verifyJWT,
  tenantTransaction.rejectTransaction
);
router.post(
  '/api/transactions/cancelOrders/:id',
  verifyJWT,
  tenantTransaction.cancelUserOrders
);
router.post(
  '/api/transactions/acceptOrders/:id',
  verifyJWT,
  tenantTransaction.acceptUserOrders
);

module.exports = router;
