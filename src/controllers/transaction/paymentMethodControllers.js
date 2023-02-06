const database = require('../../models');
const paymentmethod = database.paymentmethod;

const getPaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId } = req.params;

    const getData = await paymentmethod.findOne({
      where: { id: paymentMethodId },
    });

    res.status(200).send(getData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

module.exports = { getPaymentMethod };
