const UserRepository = require('../persistency/repository/UserRepository');
const initUser = require('../persistency/model/User');
class UserService {

    constructor(sequelize) {
        this.userRepository = new UserRepository(initUser(sequelize));
    }

    findUserByEmail(email) {
        return this.userRepository.findByEmail(email);
    }

    createUser(user) {
        return this.userRepository.createUser(user)
    }

}

module.exports = UserService