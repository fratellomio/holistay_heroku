const router = require('express').Router();

const { propertyControllers } = require('../../controllers');

router.get('/api/property/detail/:id', propertyControllers.getById);

module.exports = router;
