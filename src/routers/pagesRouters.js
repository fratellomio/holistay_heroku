const router = require('express').Router()

const {pagesControllers, tenantControllers, tenantTransaction, reportControllers} = require("../controllers")

router.post('/api/landingpage', pagesControllers.landingPage);
router.post('/api/detail/property/:id', pagesControllers.getById);
router.get('/api/category', tenantControllers.getAllCategory)
router.get('/api/total/chart/:tenantId', tenantTransaction.getDataChart)
router.get('/api/report', reportControllers.reportTransactions)
router.get('/api/report/guest', reportControllers.reportGuestTransactions)
router.get('/api/report/room', reportControllers.reportRoomsTransactions)

module.exports = router;