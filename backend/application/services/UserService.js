const UserRepository = require('../persistency/repository/UserRepository');
const {UserPermissionsWrapper, Permissions} = require('../persistency/querywrappers/UserPermissionsWrapper')
const initUser = require('../persistency/model/User');
const initUserPermits = require('../persistency/model/UserPermits');
const intiPermits = require('../persistency/model/Permits');
const initUserInPlant = require('../persistency/model/UserInPlant');

class UserService {

    constructor(sequelize) {
        this.userRepository = new UserRepository(initUser(sequelize), initUserPermits(sequelize), intiPermits(sequelize), initUserInPlant(sequelize), sequelize);
    }

    findUserByEmail(email) {
        return this.userRepository.findUserByEmail(email);
    }

    findUserById(id) {
        return this.userRepository.findUserById(id);
    }

    async createUser(email, password, name, surname, partner) {
        return await this.userRepository.createUser(email, password, name, surname, partner)
    }

    async createUserInField(userId, source, refStructureName, companyName, fieldName, plantNum, plantRow, wateringAdvice) {
        return await this.userRepository.createUserInPlant(userId, source, refStructureName, companyName, fieldName, plantNum, plantRow, wateringAdvice)
    }

    async createUserPermits(userId, supergroup, source, refStructureName, companyName, fieldName, plantNum, plantRow) {
        const permits = await this.userRepository.findAllPermits()
        const supergroups = permits.map(permit => permit.dataValues.supergroup)
        if(!supergroups.some(v =>  v === supergroup)) throw Error('Permit not exist')
        return this.userRepository.createUserPermits(userId, source, supergroup, refStructureName, companyName, fieldName, plantNum, plantRow)
    }

    async findUserPermissionsByEmail(email) {
        const result = await this.userRepository.findUserPermissionsByEmail(email)
        if(result.dataValues) {
            const idUser = result.dataValues.userId
            const userEmail = result.dataValues.email
            const partner = result.dataValues.partner
            const permissions = result.dataValues.user_permits.reduce((accumulator, currentValue) => {
                const key = {
                    refStructureName: currentValue.refStructureName,
                    companyName: currentValue.companyName,
                    fieldName: currentValue.fieldName,
                    plantNum: currentValue.plantNum,
                    plantRow: currentValue.plantRow
                };
                if(accumulator.has(JSON.stringify(key)) && currentValue.permit)
                    accumulator.get(JSON.stringify(key)).push(currentValue.permit.permit)
                else {
                    accumulator.set(JSON.stringify(key), [])
                    if(currentValue.permit)
                        accumulator.get(JSON.stringify(key)).push(currentValue.permit.permit)
                }
                return accumulator;
            }, new Map());
            return new UserPermissionsWrapper(idUser, userEmail, partner, permissions)
        }
        return undefined
    }

    async findUserPermissionsByFieldAndId(id) {
        const result = await this.userRepository.findUserPermissionsById(id)
        if(result && result.dataValues) {
            const idUser = result.dataValues.userId
            const userEmail = result.dataValues.email
            const partner = result.dataValues.partner
            const permissions = result.dataValues.user_permits.reduce((accumulator, currentValue) => {
                const key = {
                    refStructureName: currentValue.refStructureName,
                    companyName: currentValue.companyName,
                    fieldName: currentValue.fieldName,
                    plantNum: currentValue.plantNum,
                    plantRow: currentValue.plantRow
                };
                if(accumulator.has(JSON.stringify(key)) && currentValue.permits)
                    accumulator.get(JSON.stringify(key)).push(...currentValue.permits.map(p => p.permit))
                else {
                    accumulator.set(JSON.stringify(key), [])
                    if(currentValue.permits)
                        accumulator.get(JSON.stringify(key)).push(...currentValue.permits.map(p => p.permit))
                }
                return accumulator;
            }, new Map());
            return new UserPermissionsWrapper(idUser, userEmail, partner, permissions)
        }
        return undefined
    }

    async findUserPermissionsById(id) {
        const result = await this.userRepository.findUserPermissionsById(id)
        if(result && result.dataValues) {
            const uniquePermits = new Set();
            result.dataValues.user_permits.forEach((value) => {
                value.permits.forEach((p) => {
                    uniquePermits.add(p.permit);
                });
            });
            return Array.from(uniquePermits);
        }
        return undefined
    }


}

module.exports = UserService