'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transaction.belongsTo(models.user, {
        foreignKey: {
          allowNull: false,
        },
      });
      transaction.belongsTo(models.room, {
        foreignKey: {
          allowNull: false,
        },
      });
      transaction.hasOne(models.review);
      transaction.hasOne(models.payment);
      transaction.hasOne(models.guest);
    }
  }
  transaction.init(
    {
      checkIn: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      checkOut: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      transactionStatus: {
        type: DataTypes.ENUM(
          'Menunggu Pembayaran',
          'Menunggu Konfirmasi Pembayaran',
          'Dibatalkan',
          'Gagal',
          'Diproses'
        ),
        defaultValue: 'Menunggu Pembayaran',
        allowNull: false,
      },
      isReminded: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'transaction',
      indexes: [
        {
          unique: false,
          fields: ['transactionStatus'],
        },
      ],
    }
  );
  return transaction;
};
