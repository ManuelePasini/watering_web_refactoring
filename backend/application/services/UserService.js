const UserRepository = require('../persistency/repository/UserRepository');
const {UserPermissionsWrapper, Permissions} = require('../persistency/querywrappers/UserPermissionsWrapper')
const initUser = require('../persistency/model/User');
const initFieldsPermit = require('../persistency/model/FieldsPermit');
const initTranscodingField = require('../persistency/model/TranscodingField')

class UserService {

    constructor(sequelize) {
        this.userRepository = new UserRepository(initUser(sequelize), initFieldsPermit(sequelize), initTranscodingField(sequelize), sequelize);
    }

    findUser(user) {
        return this.userRepository.findUser(user);
    }

    async createUsers(request) {
        return request.users.map(async user => await this.userRepository.createUser(user.username, user.authType, user.affiliation, user.pwd, user.name))
    }

    async createUserInField(userId, source, refStructureName, companyName, fieldName, plantNum, plantRow, wateringAdvice) {
        return await this.userRepository.createUserInPlant(userId, source, refStructureName, companyName, fieldName, plantNum, plantRow, wateringAdvice)
    }

    async createUserGrants(affiliation, request) {
        const affiliationFields = await this.userRepository.findFieldsByAffiliation(affiliation)

        request.grants.map(grant => {
            const key = `${grant.structureName} - ${grant.companyName} - ${grant.fieldName} - ${grant.sectorName} - ${grant.thesis}`;
            if (!affiliationFields.has(key))
                throw Error(`Affiliation ${affiliation} has no permission to create grants for field ${key}`)
        })

        for(const grant of request.grants) {
            const userToGrant = await this.findUser(grant.userId)
            if(userToGrant.dataValues.affiliation !== affiliation)
                throw new Error(`Affiliation mismatch between user ${userToGrant.affiliation} and requestor ${affiliation}]`)

            for(const permit of grant.applications)
                await this.userRepository.createFieldPermit(grant.userId, affiliation, grant.structureName, grant.companyName, grant.fieldName, grant.sectorName, grant.thesis, permit)
        }
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

    async findUserPermissions(user) {
        try {
            const result = await this.userRepository.findUserPermissions(user)
            if (result && result.dataValues) {
                const user = result.dataValues.user
                const affiliation = result.dataValues.affiliation
                const role = result.dataValues.role
                const permissions = result.dataValues.permit_fields.reduce((accumulator, currentValue) => {
                    const key = {
                        refStructureName: currentValue.dataValues.refStructureName,
                        companyName: currentValue.dataValues.companyName,
                        fieldName: currentValue.dataValues.fieldName,
                        sectorName: currentValue.dataValues.sectorName,
                        thesis: currentValue.dataValues.thesis
                    };

                    const keyString = JSON.stringify(key);

                    if (!accumulator.has(keyString)) {
                        accumulator.set(keyString, new Set());
                    }

                    if (currentValue.dataValues.permit) {
                        accumulator.get(keyString).add(currentValue.dataValues.permit);
                    }

                    return accumulator;
                }, new Map());
                return new UserPermissionsWrapper(user, affiliation, role, permissions)
            }
            return undefined
        } catch (error) {
            return undefined
        }
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