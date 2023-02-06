const database = require('../models');
const user = database.user;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('../middlewares/nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
const { OTP_generator } = require('../middlewares/otp_service');
const path = require('path');

module.exports = {
  users: async (req, res) => {
    try {
      const users = await user.findAll({
        attributes: ['id', 'fullName', 'email'],
      });

      res.json({ users });
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  userById: async (req, res) => {
    try {
      const { id } = req.params;
      const userById = await user.findOne({
        where: {
          id,
        },
      });

      res.json({ userById });
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  getUser: async (req, res) => {
    try {
      const isAccountExist = await user.findOne({
        where: {
          email: req.user,
        },
        raw: true,
      });
      res.status(200).send(isAccountExist);
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  checkEmail: async (req, res) => {
    try {
      console.log(req.params.email);
      const isAccountExist = await user.findOne({
        where: {
          email: req.params.email,
        },
        raw: true,
      });
      res.status(200).send(isAccountExist);
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  updateProfile: async (req, res) => {
    try {
      const { fullName, gender, birthdate, id } = req.body;
      await user.update(
        { fullName, gender, birthdate },
        {
          where: {
            id,
          },
        }
      );
      res.status(200).send('Update Success');
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  },
  updateProfilePic: async (req, res) => {
    try {
      if (!req.files) {
        res.status(500);
        res.send({
          status: false,
          message: 'No file uploaded',
        });
      }

      const { fileUploaded } = req.files;
      const { userId } = req.body;

      const extensionName = path.extname(fileUploaded.name);
      const allowedExtension = ['.png', '.jpg', '.jpeg', '.webp'];

      if (!allowedExtension.includes(extensionName))
        throw 'Invalid image extension';

      const filename = `avatar${userId}${extensionName}`;

      await user.update(
        {
          photo: filename,
        },
        {
          where: {
            email: req.user,
          },
        }
      );

      fileUploaded.mv('./src/public/profilePicture/' + filename);
      res.status(200).send({
        massage: 'Update Profile Picture Success',
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  },
  updatePass: async (req, res) => {
    try {
      const { password, password_confirmation } = req.body;
      if (password !== password_confirmation) throw 'Password does not match';
      if (password.length < 8) throw 'Password is less than 8 characters';
      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash(password, salt);
      await user.update(
        { password: hashPass },
        {
          where: {
            email: req.user,
          },
        }
      );
      res.status(200).send('Update Success');
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  },
  checkPass: async (req, res) => {
    try {
      const { oldPassword } = req.body;
      console.log(oldPassword);
      const isAccountExist = await user.findOne({
        where: {
          email: req.user,
        },
        raw: true,
      });

      const isValid = await bcrypt.compare(
        oldPassword,
        isAccountExist.password
      );

      if (!isValid) throw 'password is incorrect';

      res.status(200).send(true);
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  sendOTP: async (req, res) => {
    try {
      const { email } = req.body;
      const otp = OTP_generator();
      const token = jwt.sign({ email: email }, otp, {
        expiresIn: '5m',
      });
      console.log(email);
      console.log(token);

      const tempEmail = fs.readFileSync(
        './src/emailTemplates/otpEmail.html',
        'utf-8'
      );
      const tempCompile = handlebars.compile(tempEmail);

      const tempResult = tempCompile({
        fullName: 'Ilham',
        otp,
      });

      await nodemailer.sendMail({
        from: 'Admin',
        to: email,
        subject: 'User verification',
        html: tempResult,
      });

      res.status(200).send({
        message: 'Email Succes Sender',
        token,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
  verification: async (req, res) => {
    const { otp, email } = req.body;
    try {
      const verify = jwt.verify(email, otp);
      if (!verify) throw 'Wrong Code OTP';

      await user.update(
        { email: verify.email },
        {
          where: {
            email: req.user,
          },
        }
      );

      const token2 = jwt.sign(
        { email: verify.email },
        process.env.ACCESS_TOKEN_SECRET_KEY
      );

      res.status(200).send({
        message: 'Verification Sucess!',
        token: token2,
        email: verify.email,
      });
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  },
};
