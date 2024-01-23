const {Model, DataTypes} = require('sequelize');

class User extends Model {

}

function initUser(sequelize) {
    User.init({
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        partner: {
          type: DataTypes.STRING,
          allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: DataTypes.STRING,
        surname: DataTypes.STRING
    }, {
        modelName: 'watering_user',
        timestamps: false,
        sequelize
    });

    return User;
}

module.exports = initUser;