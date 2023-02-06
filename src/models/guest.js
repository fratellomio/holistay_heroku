'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class guest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      guest.belongsTo(models.transaction, {
        foreignKey: {
          allowNull: false,
        },
      });
    }
  }
  guest.init(
    {
      adult: { type: DataTypes.INTEGER, allowNull: false },
      children: { type: DataTypes.INTEGER, allowNull: false },
      infant: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: 'guest',
    }
  );
  return guest;
};
