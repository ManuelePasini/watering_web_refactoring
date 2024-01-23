const hashPassword = require('../../commons/hashPassword')

class UserRepository {

    constructor(User, UserPermits, Permits, UserInPlant, sequelize) {
        this.User = User
        this.UserPermits = UserPermits
        this.Permits = Permits
        this.UserInPlant = UserInPlant
        this.sequelize = sequelize

        User.hasMany(UserPermits, { foreignKey: 'userId' });
        UserPermits.belongsTo(User, { foreignKey: 'userId' });

        UserPermits.hasMany(Permits, { sourceKey: 'supergroup', foreignKey: 'supergroup' });
        Permits.belongsTo(UserPermits, { targetKey: 'supergroup', foreignKey: 'supergroup' });
    }

    findUserByEmail(email) {
        return this.User.findOne({where: {email:email}});
    }

    findUserById(userId) {
        return this.User.findOne({where: {userId:userId}});
    }

    async findUserPermissionsByEmail(email) {
        try {
            return await this.User.findOne({
                where: {email:email},
                include: [
                    {
                        model: this.UserPermits,
                        include: [
                            {
                                model: this.Permits,
                            },
                        ],
                    },
                ],
            });

        } catch (error) {
            console.error('Error on find user:', error);
        }
    }

    async findUserPermissionsById(id) {
        try {
            return await this.User.findOne({
                where: {userId:id},
                include: [
                    {
                        model: this.UserPermits,
                        include: [
                            {
                                model: this.Permits,
                            },
                        ],
                    },
                ],
            });

        } catch (error) {
            console.error('Error on find user:', error);
        }
    }

    async createUser(email, password, name, surname, partner) {
        let user = this.User.build({email: email, password: hashPassword(password), name: name, surname: surname, partner: partner})
        return await user.save();
    }

    async createUserInPlant(userId, source, refStructureName, companyName, fieldName, plantNum, plantRow, wateringAdvice){
        let model = this.UserInPlant.build({userId: userId, source:source, refStructureName: refStructureName, companyName: companyName, fieldName: fieldName, plantNum: plantNum, plantRow: plantRow, wateringAdvice: wateringAdvice})
        this.UserInPlant.removeAttribute('id')
        return await model.save()
    }

    async createUserPermits(userId, source, supergroup, refStructureName, companyName, fieldName, plantNum, plantRow) {
        let model = this.UserPermits.build({userId: userId, source: source, supergroup: supergroup, refStructureName: refStructureName, companyName: companyName, fieldName: fieldName, plantNum: plantNum, plantRow: plantRow})
        return await model.save()
    }

    async findAllPermits() {
        return await this.Permits.findAll({
            attributes: ['supergroup']
        })
    }

}

module.exports = UserRepository;