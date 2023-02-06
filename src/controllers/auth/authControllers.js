const database = require('../../models');
const user = database.user;
const tenant = database.tenant;
const userLogin = database.login;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('../../middlewares/nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
const { OTP_generator } = require('../../middlewares/otp_service');

module.exports = {
  register: async (req, res) => {
    try {
      const { email, password, fullName } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash(password, salt);
      const otp = OTP_generator();

      await user.create({
        email,
        password: hashPass,
        fullName,
      });

      const token = jwt.sign({ email: email }, otp, {
        expiresIn: '10m',
      });

      const tempEmail = fs.readFileSync(
        './src/emailTemplates/verificationEmail.html',
        'utf-8'
      );
      const tempCompile = handlebars.compile(tempEmail);

      const tempResult = tempCompile({
        fullName,
        otp,
        link: `https://holistay.herokuapp.com/verification/${token}`,
      });

      await nodemailer.sendMail({
        from: 'Admin',
        to: email,
        subject: 'User verification',
        html: tempResult,
      });

      res
        .header('Access-Control-Allow-Credentials', true)
        .cookie('email', email, {
          maxAge: 60 * 5000,
          httpOnly: false,
          path: '/',
        })
        .status(201)
        .send({
          message:
            'Register Success. Please check your email for verification link',
          token,
        });
    } catch (error) {
      res.status(400).send(error);
    }
  },

  verification: async (req, res) => {
    const { token } = req.query;
    const { otp } = req.body;

    try {
      const verify = jwt.verify(token, otp);

      await user.update(
        {
          verified: true,
        },
        {
          where: {
            email: verify.email,
          },
        }
      );

      const verifiedUser = await user.findOne({
        where: {
          email: verify.email,
        },
      });

      const { email, fullName } = verifiedUser.dataValues;

      const tempEmail = fs.readFileSync(
        './src/emailTemplates/successVerificationEmail.html',
        'utf-8'
      );
      const tempCompile = handlebars.compile(tempEmail);
      const tempResult = tempCompile({
        email,
        fullName,
      });

      await nodemailer.sendMail({
        from: 'Admin',
        to: email,
        subject: 'Verification Success',
        html: tempResult,
      });

      res.status(200).send({ message: 'Verification Sucess!' });
    } catch (err) {
      res.status(400).send(err);
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    let browser = req.device.client.name;
    let device = req.device.device.type;

    const emailExist = await user.findOne({
      where: {
        email,
      },
    });

    const isValidPassword = await bcrypt.compare(password, emailExist.password);
    if (isValidPassword) {
      if (emailExist.verified == true) {
        let payload = {
          email: emailExist.email,
          userId: emailExist.id,
          isTenant: emailExist.isTenant,
        };

        const accessToken = jwt.sign(
          payload,
          process.env.ACCESS_TOKEN_SECRET_KEY,
          {
            expiresIn: '2h',
          }
        );

        const refreshToken = jwt.sign(
          payload,
          process.env.REFRESH_TOKEN_SECRET_KEY,
          { expiresIn: '7d' }
        );

        const [loginFound, created] = await userLogin.findOrCreate({
          where: {
            userId: emailExist.id,
            device,
            browser,
          },
          defaults: { refreshToken },
        });

        if (!created) {
          await userLogin.update(
            { refreshToken },
            {
              where: {
                userId: emailExist.id,
                device,
                browser,
              },
            }
          );
        }

        const tenantInfo = await tenant.findOne({
          where: {
            userId: emailExist.id,
          },
        });

        const daysForCookie = 7;

        res.header('Access-Control-Allow-Credentials', true);
        res.cookie('refreshToken', refreshToken, {
          maxAge: daysForCookie * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'None',
          secure: true,
        });
        res.send({
          accessToken,
          userEmail: emailExist.email,
          name: emailExist.fullName,
          userId: emailExist.id,
          userPhoto: emailExist.photo,
          isTenant: emailExist.isTenant,
          tenantId: tenantInfo?.id || '',
        });
      } else {
        res.status(403).send({
          message: 'user is not verified yet. Please check your email',
        });
      }
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  },
  resendOTP: async (req, res) => {
    try {
      const { email } = req.body;

      const emailExist = await user.findOne({
        where: {
          email,
        },
        raw: true,
      });

      if (emailExist === null) {
        res.status(400).send({ message: 'email is not registered yet' });
      }

      const otp = OTP_generator();

      const token = jwt.sign({ email: email }, otp, {
        expiresIn: '5m',
      });

      const tempEmail = fs.readFileSync(
        './src/emailTemplates/verificationEmail.html',
        'utf-8'
      );
      const tempCompile = handlebars.compile(tempEmail);

      const tempResult = tempCompile({
        fullName: emailExist.fullName,
        otp,
        link: `https://holistay.herokuapp.com/verification/${token}`,
      });

      await nodemailer.sendMail({
        from: 'Admin',
        to: email,
        subject: 'User verification',
        html: tempResult,
      });

      res
        .header('Access-Control-Allow-Credentials', true)
        .cookie('email', email, {
          maxAge: 60 * 5000,
          httpOnly: false,
          path: '/',
        })
        .status(200)
        .send({
          message: 'Resent OTP Success',
          token,
        });
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },

  forgotPassword: async (req, res) => {
    const browser = req.device.client.name;
    const device = req.device.device.type;
    const { email } = req.body;
    const emailExist = await user.findOne({
      where: {
        email,
      },
      raw: true,
    });

    if (emailExist === null) {
      res.status(400).send({ message: 'email is not registered yet' });
    }
    if (emailExist.verified == false) {
      res.status(400).send({
        message: 'user is not verified yet. Please check your email',
      });
    }

    const token = jwt.sign({ email }, process.env.RESET_PASSWORD_SECRET_KEY, {
      expiresIn: '15m',
    });

    const tempEmail = fs.readFileSync(
      './src/emailTemplates/forgotPassword.html',
      'utf-8'
    );
    const tempCompile = handlebars.compile(tempEmail);

    const tempResult = tempCompile({
      email,
      browser,
      device,
      link: `https://holistay.herokuapp.com/resetpassword/${emailExist.id}/${token}`,
    });

    await nodemailer.sendMail({
      from: 'Admin',
      to: email,
      subject: 'Reset Password Request',
      html: tempResult,
    });

    res.status(200).send({ message: 'Success', email });
  },

  resetPassword: async (req, res) => {
    const { password, id, token } = req.body;

    try {
      jwt.verify(token, process.env.RESET_PASSWORD_SECRET_KEY);
      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash(password, salt);

      await user.update(
        {
          password: hashPass,
        },
        {
          where: {
            id,
          },
        }
      );

      res.status(200).send({ message: 'Reset Password Success' });
    } catch (error) {
      res.status(401).send(error.message);
    }
  },

  test: async (req, res) => {
    try {
      res.send('test auth controller');
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },
};
