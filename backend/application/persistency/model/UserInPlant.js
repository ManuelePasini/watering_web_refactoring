const {Model, DataTypes} = require('sequelize');
const sequelize = require('../../configs/dbConfig');

class UserInPlant extends Model {

}

UserInPlant.init({
    source: DataTypes.TEXT,
    refStructureName: DataTypes.TEXT,
    companyName: DataTypes.TEXT,
    fieldName: DataTypes.TEXT,
    plantNum: DataTypes.BIGINT,
    plantRow: DataTypes.TEXT,
    userId: DataTypes.BIGINT,
    wateringAdvice: DataTypes.BOOLEAN,
}, {
    modelName: "user_in_plant",
    timestamps: false,
    sequelize
})

module.exports = UserInPlant;