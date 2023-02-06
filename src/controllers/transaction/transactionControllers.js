const database = require('../../models');
const { sequelize } = require('../../models');
const transaction = database.transaction;
const { Op, QueryTypes } = require('sequelize');

const getTransactionByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    const getTansactions = await transaction.findAll({
      attributes: ['checkIn', 'checkOut'],
      where: {
        [Op.and]: [
          { roomId },
          {
            [Op.and]: [
              { transactionStatus: { [Op.ne]: 'Gagal' } },
              { transactionStatus: { [Op.ne]: 'Dibatalkan' } },
            ],
          },
        ],
      },
    });

    res.status(200).send(getTansactions);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const getTansactions = await sequelize.query(
      `select 
          t.id, t.transactionStatus, t.userId, t.checkIn, t.checkOut, r.propertyId, p.name as property_name, r.name as room_name, r.price, r.picture, sum(g.adult + g.children + g.infant) as total_guest, t.createdAt 
      from transactions as t 
      join guests as g 
      on t.id = g.transactionId
      join rooms as r
      on t.roomId = r.id
      join properties as p
      on p.id = r.propertyId
      where t.id = ${id}`,
      { type: QueryTypes.SELECT }
    );

    res.status(200).send(getTansactions);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

module.exports = { getTransactionByRoomId, getTransactionById };
