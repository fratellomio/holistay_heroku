'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      property.belongsTo(models.tenant, {
        foreignKey: {
          allowNull: false,
        },
      });
      property.belongsTo(models.category, {
        foreignKey: {
          allowNull: false,
        },
      });
      property.hasMany(models.room, { onDelete: 'cascade' });
      property.belongsToMany(models.facility, { through: 'propertyFacility' });
      property.hasMany(models.propertypicture)
    }
  }
  property.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      picture: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: 'property',
    }
  );
  return property;
};
