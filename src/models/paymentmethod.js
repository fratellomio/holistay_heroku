'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class paymentmethod extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      paymentmethod.hasMany(models.payment);
    }
  }
  paymentmethod.init(
    {
      method: DataTypes.STRING,
      accountNumber: DataTypes.STRING,
      accountHolderName: DataTypes.STRING,
      logo: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'paymentmethod',
      timestamps: false,
    }
  );
  return paymentmethod;
};
