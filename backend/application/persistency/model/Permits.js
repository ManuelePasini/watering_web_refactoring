const {Model, DataTypes} = require('sequelize');

class Permits extends Model {

}

function initPermits(sequelize) {

  Permits.init({
      permit: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      supergroup: {
        type: DataTypes.STRING,
        allowNull: false
      },
      desc: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      modelName: 'permits',
      timestamps: false,
      sequelize
    }
  )

  return Permits
}

module.exports = initPermits;