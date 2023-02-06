'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      review.belongsTo(models.transaction, {
        foreignKey: {
          allowNull: false,
        },
      });
    }
  }
  review.init(
    {
      review: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'review',
    }
  );
  return review;
};
