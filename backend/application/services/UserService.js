const UserRepository = require('../persistency/repository/UserRepository');
const FieldRepository = require('../persistency/repository/FieldRepository');
const { UserFieldPermission, UserFieldPermissions } = require('../persistency/querywrappers/UserPermissionsWrapper');
const initUser = require('../persistency/model/User');
const initFieldsPermit = require('../persistency/model/FieldsPermit');
const initTranscodingField = require('../persistency/model/TranscodingField')

class UserService {

    constructor(sequelize) {
        this.userRepository = new UserRepository(initUser(sequelize), initFieldsPermit(sequelize), initTranscodingField(sequelize), sequelize);
        this.fieldRepository = new FieldRepository(undefined, undefined, initTranscodingField(sequelize), sequelize)
    }

    async findUser(user) {
        return await this.userRepository.findUser(user);
    }

    async findUserByEmail(email) {
        return await this.userRepository.findUserByEmail(email);
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

    async findUserPermissions(userid, timeFilterFrom, timeFilterTo) {
        try {

            const user = (await this.findUser(userid)).dataValues
            let results
            if (timeFilterFrom && timeFilterTo) {
                if (user.role === "admin") {
                    results = await this.userRepository.findAdminPermissionsInPeriod(timeFilterFrom, timeFilterTo)
                } else {
                    results = await this.userRepository.findUserPermissionsInPeriod(userid, timeFilterFrom, timeFilterTo)
                }
            } else {
                if (user.role === "admin") {
                    results = await this.userRepository.findAdminPermissions()
                } else {
                    results = await this.userRepository.findUserPermissions(userid)
                }
            }
            if (results) {
                return await this.computeUserPermissions(user, results)
            } else {
                throw new Error("Invalid result")
            }
        } catch (error) {
            console.error(error)
        }
    }

    async computeUserPermissions(user, results) {
        try {
            const fields = new Map();

            for (const field of results) {
                const fieldDetails = await this.fieldRepository.getFieldDetails(
                    field.refStructureName,
                    field.companyName,
                    field.fieldName,
                    field.sectorName,
                    field.plantRow
                );

                const keyString = JSON.stringify(fieldDetails.dataValues);

                if (!fields.has(keyString)) {
                    fields.set(keyString, new Set());
                }

                if (field.permit) {
                    fields.get(keyString).add(field.permit);
                } else if (user.role === "admin") {
                    fields.get(keyString).add("*")
                }
            }

            const userFieldsPermissions = Array.from(fields, ([keyString, permissions]) => {
                const key = JSON.parse(keyString);
                return new UserFieldPermission(
                  key.refStructureName,
                  key.companyName,
                  key.fieldName,
                  key.sectorName,
                    key.plantRow,
                    key.colture,
                    key.coltureType,
                  [...permissions] // Spread operator to convert Set to Array
                );
            });
            return new UserFieldPermissions(user.email, user.affiliation, user.role, userFieldsPermissions)
        } catch (error) {
            console.error(error)
        }
    }

}

module.exports = UserService