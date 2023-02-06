const router = require('express').Router();
const middlewareDetect = require('../../middlewares/deviceDetector');

const { authControllers } = require('../../controllers');

const {
  runValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation,
} = require('../../middlewares/validator');

router.post(
  '/api/register',
  registerValidation,
  runValidation,
  authControllers.register
);
router.post(
  '/api/login',
  loginValidation,
  runValidation,
  middlewareDetect,
  authControllers.login
);
router.post('/api/verification/', authControllers.verification);
router.post('/api/resendOTP/', authControllers.resendOTP);
router.post('/api/forgotPassword/', authControllers.forgotPassword);
router.post(
  '/api/resetPassword/',
  resetPasswordValidation,
  runValidation,
  authControllers.resetPassword
);
router.get('/api/test/', authControllers.test);

module.exports = router;
