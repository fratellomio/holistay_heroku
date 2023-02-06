const express = require('express');
const router = express.Router();
const { logoutController } = require('../../controllers');

router.get('/api/logout', logoutController.handleLogout);

module.exports = router;
