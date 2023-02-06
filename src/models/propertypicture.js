"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class propertypicture extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      propertypicture.belongsTo(models.property, {
        foreignKey: {
          allowNull: false,
        },
      });
    }
  }
  propertypicture.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "propertypicture",
    }
  );
  return propertypicture;
};