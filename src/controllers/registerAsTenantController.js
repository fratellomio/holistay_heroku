const path = require('path');
const database = require('../models');
const tenant = database.tenant;
const checkKTP = require('../middlewares/checkKTP');

const RegisterAsTenant = async (req, res) => {
  const { KTPNumber, userId, autoDetect } = req.body;
  const ktp = req.files.KTPPhoto;

  const findTenant = await tenant.findOne({
    where: { userId },
  });

  if (findTenant) {
    res.status(500);
    res.send({
      message: 'User is already a tenant',
    });
  } else {
    if (!req.files) {
      res.status(500);
      res.send({
        status: false,
        message: 'No file uploaded',
      });
    }

    if (KTPNumber.length !== 16) {
      res.status(500);
      res.send({
        status: false,
        message: 'KTP Number must be 16 digits',
      });
    }

    const extensionName = path.extname(ktp.name);
    const allowedExtension = ['.png', '.jpg', '.jpeg', '.webp'];

    if (!allowedExtension.includes(extensionName)) {
      res.status(422);
      res.send({
        status: false,
        message: 'Invalid image extension',
      });
    }

    const filename = `user${userId}${extensionName}`;

    const newTenant = await tenant.create({
      KTPPhoto: filename,
      KTPNumber,
      userId,
    });

    console.log(newTenant);

    ktp.mv('./src/public/ktp/' + filename);

    res.status(201);
    res.send({
      status: true,
      message: 'file is uploaded',
      data: {
        KTPNumber,
        tenantId: newTenant?.id,
        name: ktp.name,
        mimetype: ktp.mimetype,
        size: ktp.size,
      },
    });

    if (autoDetect) {
      const check = await checkKTP(filename);
      check == KTPNumber
        ? res.status(200).send({ message: 'Automatic verification success' })
        : res
            .status(500)
            .send({ message: 'Not a match, switch to manual verification' });
    } else {
      res.status(200);
      res.send({
        status: true,
        message:
          'Photo is successufully uploaded, please wait for manual verification by our staff',
        data: {
          KTPNumber,
          tenantId: newTenant?.id,
          name: ktp.name,
          mimetype: ktp.mimetype,
          size: ktp.size,
        },
      });
    }
  }
};

const test = async (req, res) => {
  res.sendStatus(200);
};

module.exports = { RegisterAsTenant, test };
