const UserRepository = require('../persistency/repository/UserRepository');
const {UserFieldPermission, UserFieldPermissions } = require('../persistency/querywrappers/UserPermissionsWrapper')
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
        try {
            const result = await Promise.all(request.users.map(async user => {
                try {
                    await this.userRepository.createUser(user.username, user.authType, user.affiliation, user.password, user.name);
                } catch (error) {
                    console.error(`Error creating user ${user.username}: ${error.message}`);
                    throw error;
                }
            }));
        } catch (error) {
            console.error(`Error during creating users: ${error.message}`);
            throw error;
        }
    }

    async createUserGrants(affiliation, request) {
        const affiliationFields = await this.userRepository.findFieldsByAffiliation(affiliation)

        request.grants.map(grant => {
            const key = `${grant.structureName} - ${grant.companyName} - ${grant.fieldName} - ${grant.sectorName} - ${grant.plantRow}`;
            if (!affiliationFields.has(key))
                throw Error(`Affiliation ${affiliation} has no permission to create grants for field ${key}`)
        })

        for(const grant of request.grants) {
            const userToGrant = await this.findUser(grant.userId)
            if(userToGrant.dataValues.affiliation !== affiliation)
                throw new Error(`Affiliation mismatch between user ${userToGrant.affiliation} and requestor ${affiliation}]`)

            for(const permit of grant.applications)
                await this.userRepository.createFieldPermit(grant.userId, affiliation, grant.structureName, grant.companyName, grant.fieldName, grant.sectorName, grant.plantRow, permit)
        }
    }

    async findUserPermissions(user) {
        try {
            const result = await this.userRepository.findUserPermissions(user)
            if (result && result.dataValues && result.dataValues.role === 'admin') {
                const adminResult = await this.userRepository.findAdminPermissions()
                if(adminResult)
                    return this.computeAdminPermissions(user, adminResult)
                return undefined
            } else if(result && result.dataValues) {
                return this.computeUserPermissions(result)
            }
            return undefined
        } catch (error) {
            return undefined
        }
    }

    computeUserPermissions(result){
        try {
            const user = result.dataValues.userid
            const affiliation = result.dataValues.affiliation
            const role = result.dataValues.role
            const fields = result.dataValues.permit_fields.reduce((accumulator, currentValue) => {
                const key = {
                    refStructureName: currentValue.dataValues.refStructureName,
                    companyName: currentValue.dataValues.companyName,
                    fieldName: currentValue.dataValues.fieldName,
                    sectorName: currentValue.dataValues.sectorName,
                    plantRow: currentValue.dataValues.plantRow
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

            const userFieldsPermissions = Array.from(fields, ([keyString, permissions]) => {
                const key = JSON.parse(keyString);
                return new UserFieldPermission(
                  key.refStructureName,
                  key.companyName,
                  key.fieldName,
                  key.sectorName,
                    key.plantRow,
                  [...permissions] // Spread operator to convert Set to Array
                );
            });


            return new UserFieldPermissions(user, affiliation, role, userFieldsPermissions)
        } catch (error) {
            return undefined
        }
    }

    computeAdminPermissions(user, results) {
        try {
            const fields = results.reduce((accumulator, currentValue) => {
                const key = {
                    refStructureName: currentValue.dataValues.refStructureName,
                    companyName: currentValue.dataValues.companyName,
                    fieldName: currentValue.dataValues.fieldName,
                    sectorName: currentValue.dataValues.sectorName,
                    plantRow: currentValue.dataValues.plantRow
                };

                const keyString = JSON.stringify(key);

                if (!accumulator.has(keyString)) {
                    accumulator.set(keyString, new Set());
                }

                accumulator.get(keyString).add('*')

                return accumulator;
            }, new Map());

            const userFieldsPermissions = Array.from(fields, ([keyString, permissions]) => {
                const key = JSON.parse(keyString);
                return new UserFieldPermission(
                  key.refStructureName,
                  key.companyName,
                  key.fieldName,
                  key.sectorName,
                    key.plantRow,
                  [...permissions] // Spread operator to convert Set to Array
                );
            });


            return new UserFieldPermissions(user, user, 'admin', userFieldsPermissions)
        } catch (error) {
            return undefined
        }
    }
}

module.exports = UserService