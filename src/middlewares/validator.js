const { check, validationResult, body } = require('express-validator');
const database = require('../models');
const user = database.user;

exports.runValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: errors.array()[0].msg,
    });
  }
  next();
};

exports.loginValidation = [
  check('email', 'Please input your email').notEmpty(),
  check('email', 'Please input a valid email').isEmail(),
  body('email').custom((value) => {
    return user
      .findOne({
        where: {
          email: value,
        },
      })
      .then((user) => {
        if (!user) {
          return Promise.reject('email is not registered yet');
        }
      });
  }),
  check('password', 'Please input your password').notEmpty(),
  check('password', 'Password should be at least 8 characters').isLength({
    min: 8,
  }),
];

exports.registerValidation = [
  check('email', 'Please input your email').notEmpty(),
  check('email', 'Please input a valid email').isEmail(),
  body('email').custom((value) => {
    return user
      .findOne({
        where: {
          email: value,
        },
      })
      .then((user) => {
        if (user) {
          return Promise.reject('email is already taken');
        }
      });
  }),
  check('password', 'Please input your password').notEmpty(),
  check('password', 'Password should be at least 8 characters')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    })
    .withMessage(
      'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  body('repeatPassword').custom(async (repeatPassword, { req }) => {
    const password = req.body.password;

    if (password !== repeatPassword) {
      throw new Error('Passwords must be same');
    }
  }),
  check('fullName', 'Full Name should be at least three characters').isLength({
    min: 3,
  }),
];

exports.resetPasswordValidation = [
  check('password', 'Please input your password').notEmpty(),
  check('password', 'Password should be at least 8 characters')
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
    })
    .withMessage(
      'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  // body('repeatPassword').custom(async (repeatPassword, { req }) => {
  //   const password = req.body.password;

  //   if (password !== repeatPassword) {
  //     throw new Error('Passwords must be same');
  //   }
  // }),
];