'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      payment.belongsTo(models.transaction, {
        foreignKey: {
          allowNull: false,
        },
      });
      payment.belongsTo(models.paymentmethod, {
        foreignKey: {
          allowNull: false,
        },
      });
    }
  }
  payment.init(
    {
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      paymentProof: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'payment',
      indexes: [
        {
          unique: false,
          fields: ['createdAt'],
        },
      ],
    }
  );
  return payment;
};
