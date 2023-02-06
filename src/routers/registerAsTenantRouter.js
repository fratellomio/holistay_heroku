const express = require('express');
const router = express.Router();
const { registerAsTenantController } = require('../controllers');
const verifyJWT = require('../middlewares/verifyJWT');

router.post(
  '/api/registerAsTenant',
  verifyJWT,
  registerAsTenantController.RegisterAsTenant
);

router.get('/api/testRegTenant', registerAsTenantController.test);

module.exports = router;
