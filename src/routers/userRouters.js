const router = require('express').Router();
const { userControllers } = require('../controllers');
const verifyJWT = require('../middlewares/verifyJWT');

// router.get('/', (req, res) => {
//   res.status(200).send('home');
// });
router.get('/api/user', verifyJWT, userControllers.getUser);
router.get('/api/users', verifyJWT, userControllers.users);
router.get('/api/user/:id', verifyJWT, userControllers.userById);
router.get('/api/user/:email/available', verifyJWT, userControllers.checkEmail);
router.patch('/api/user/profile', verifyJWT, userControllers.updateProfile);
router.patch(
  '/api/user/profilePic',
  verifyJWT,
  userControllers.updateProfilePic
);
router.patch('/api/user/updatePass', verifyJWT, userControllers.updatePass);
router.post('/api/user/checkPass', verifyJWT, userControllers.checkPass);
router.post('/api/user/otpEmail', verifyJWT, userControllers.sendOTP);
router.post('/api/user/verification', verifyJWT, userControllers.verification);

module.exports = router;
