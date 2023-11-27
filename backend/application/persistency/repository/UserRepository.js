const User = require('../model/User');

class UserRepository {


    constructor(model) {
        this.model = model;
    }

    findByEmail(email) {
        return this.model.findOne({where: {email:email}});
    }

    createUser(user) {
        return this.model.create(user);
    }

}

module.exports = UserRepository;