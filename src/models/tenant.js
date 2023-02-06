'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tenant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      tenant.belongsTo(models.user, {
        foreignKey: {
          allowNull: false,
        },
      });
      tenant.hasMany(models.property);
    }
  }
  tenant.init(
    {
      KTPPhoto: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      KTPNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      sequelize,
      modelName: 'tenant',
      hooks: {
        afterCreate: (tenant, options) => {
          sequelize.models.user.update(
            {
              isTenant: true,
            },
            {
              where: {
                id: tenant.userId,
              },
            }
          );
        },
      },
    }
  );
  return tenant;
};
