const {Model, DataTypes} = require('sequelize');
const sequelize = require('../../configs/dbConfig');

class UserInPlant extends Model {

}

function initUserInPlant(sequelize) {

    UserInPlant.init({
        source: {
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
            type: DataTypes.BIGINT,
            allowNull: false
        },
        plantRow: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false
        },
        wateringAdvice: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        modelName: "user_in_plant",
        timestamps: false,
        id: false,
        sequelize
    })

    return UserInPlant
}


module.exports = initUserInPlant;