const { sequelize } = require('../../models');
const database = require('../../models');
const transaction = database.transaction;
const guest = database.guest;
// const payment = database.payment;
const { QueryTypes } = require('sequelize');

const addTransaction = async (req, res) => {
  try {
    const {
      userId,
      checkIn,
      checkOut,
      roomId,
      adultGuest,
      childrenGuest,
      infantGuest,
    } = req.body;

    if (
      !userId ||
      !checkIn ||
      !checkOut ||
      !roomId ||
      !adultGuest ||
      !childrenGuest ||
      !infantGuest
    ) {
      return res.status(500).send('Please send a complete data');
    }

    const newTransaction = await transaction.create({
      userId,
      checkIn,
      checkOut,
      roomId,
    });

    const newGuestList = await guest.create({
      transactionId: newTransaction.id,
      adult: adultGuest,
      children: childrenGuest,
      infant: infantGuest,
    });

    res.status(200).send({
      message: 'Transaction success',
      roomDetail: newTransaction,
      guestList: newGuestList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const getuserTransaction = async (req, res) => {
  try {
    const { userId } = req.params;

    const transactions = await sequelize.query(
      `select t.id, t.transactionStatus, t.checkIn, t.CheckOut, t.userId, r.propertyId, pr.name as property_name, u.fullName, t.roomId, r.name as room_name, r.picture, p.paymentmethodId, p.total, rev.review 
      from transactions as t inner join payments as p on t.id = p.transactionId inner join 
      rooms as r on t.roomId = r.id 
      inner join properties as pr on pr.id = r.propertyId inner join 
      tenants as te on te.id = pr.tenantId 
      inner join 
      users as u on u.id = te.userId 
      left join reviews as rev on rev.transactionId = t.id 
      where t.userId = ${userId};`,
      { type: QueryTypes.SELECT }
    );

    res.status(201).send(transactions);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};

const getUsersTransactions = async (req, res) => {};

const cancelTransaction = async (req, res) => {};

module.exports = {
  addTransaction,
  getUsersTransactions,
  getuserTransaction,
  cancelTransaction,
};
