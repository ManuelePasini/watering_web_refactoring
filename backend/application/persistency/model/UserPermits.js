const {Model, DataTypes} = require('sequelize')
const sequelize = require('../../configs/dbConfig')

class UserPermits extends Model {

}

function initUserPermits(sequelize) {
  UserPermits.init({
    userPermitId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false
    },
    supergroup: {
      type: DataTypes.STRING,
      allowNull: false
    },
    refStructureName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fieldName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    plantNum: {
      type: DataTypes.STRING,
      allowNull: false
    },
    plantRow: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    modelName: 'user_permits',
    timestamps: false,
    sequelize
  });

  return UserPermits;
}

module.exports = initUserPermits;