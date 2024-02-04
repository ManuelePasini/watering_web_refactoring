const {Model, DataTypes} = require('sequelize');

class User extends Model {

}

function initUser(sequelize) {
    User.init({
        user: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        auth_type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        affiliation: {
          type: DataTypes.STRING,
          allowNull: true
        },
        pwd: {
            type: DataTypes.STRING,
            allowNull: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        modelName: 'users',
        timestamps: false,
        sequelize
    });

    return User;
}

module.exports = initUser;