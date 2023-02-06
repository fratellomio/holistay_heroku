const database = require('../../models');
const path = require('path');
const { sequelize } = require('../../models');
const payment = database.payment;
const transaction = database.transaction;

const addPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { paymentMethodId, total } = req.body;

    if (!transactionId || !paymentMethodId || !total) {
      return res.status(500).send('Please send a complete data');
    }

    const addPayment = await payment.create({
      transactionId,
      paymentMethodId,
      total,
    });

    await sequelize.query(`
    CREATE EVENT payment_${addPayment.id}
    ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 2 HOUR
    DO
    UPDATE transactions JOIN payments
    ON transactions.id = payments.transactionId 
    SET transactions.transactionStatus = 
    IF(now()>payments.createdAt, 'Gagal', 'Menunggu Pembayaran' ) 
    WHERE payments.id = ${addPayment.id};
    `);

    res.status(201).send({
      message:
        'Payment method succesfully added, please check your transaction instruction',
      data: addPayment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const uploadPaymentProof = async (req, res) => {
  const { transactionId } = req.params;

  if (!req.files) {
    return res.status(400).send('Please upload a file');
  }

  const { paymentProof } = req.files;

  if (!paymentProof || !transactionId) {
    return res.status(500).send('Incomplete data ');
  }

  const extensionName = path.extname(paymentProof.name);
  const allowedExtension = ['.png', '.jpg', '.jpeg', '.webp'];

  if (!allowedExtension.includes(extensionName)) {
    return res.status(422).send({
      status: false,
      message: 'Invalid image extension',
    });
  }

  const filename = `receipt${transactionId}${extensionName}`;

  await payment.update(
    { paymentProof: filename },
    { where: { transactionId } }
  );

  await transaction.update(
    {
      transactionStatus: 'Menunggu Konfirmasi Pembayaran',
    },
    {
      where: { id: transactionId },
    }
  );

  const paymentData = await payment.findOne({
    where: { transactionId },
  });

  await sequelize.query(`
  DROP EVENT IF EXISTS payment_${paymentData.id};
  `);

  await paymentProof.mv('./src/public/paymentProof/' + filename, (err) => {
    if (err) {
      return res.status(500).send(err);
    }
  });

  res.status(200).send({
    message:
      'File is successfully uploaded, please wait for the verification process',
    data: paymentData,
  });
};

const getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const paymentData = await payment.findOne({
      where: { id: paymentId },
    });

    res.status(200).send(paymentData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const testPay = async (req, res) => {
  res.status(200).send('test');
};

module.exports = { addPayment, uploadPaymentProof, getPayment, testPay };
