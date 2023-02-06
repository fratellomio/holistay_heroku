const router = require('express').Router()

const { roomControllers } = require("../controllers")

//create data
router.post('/api/disableCertainDate/:id', roomControllers.DisableCertainDate);
router.post('/api/highSeason/:id', roomControllers.highSeason)

//delete data
router.delete('/api/deleteCertainDate/:id', roomControllers.deleteDisableCertainDate)
router.delete('/api/deleteHighSeason/:id', roomControllers.deleteHighSeaason)

module.exports = router;