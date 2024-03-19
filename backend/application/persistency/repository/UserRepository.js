const hashPassword = require('../../commons/hashPassword')

class UserRepository {

    constructor(User, FieldsPermit, TranscodingField, sequelize) {
        this.User = User
        this.FieldsPermit = FieldsPermit
        this.TranscodingField = TranscodingField
        this.sequelize = sequelize

        User.hasMany(FieldsPermit, { foreignKey: 'userid'});
        FieldsPermit.belongsTo(User, { foreignKey: 'userid'});
    }

    findUser(user) {
        return this.User.findOne({where: {userid:user}});
    }

    async findUserPermissions(user) {
        try {
            return await this.User.findOne({
                where: { userid: user },
                include: [
                    {
                        model: this.FieldsPermit,
                    },
                ]
            });
        } catch (error) {
            console.error('Error on find user:', error);
        }
    }

    async findAdminPermissions() {
        try {
            return await this.FieldsPermit.findAll();
        } catch (error) {
            console.error('Error on find admin permissions:', error);
        }
    }

    async createUser(user, auth_type, affiliation, pwd, name) {
        try {
            let userCreated = this.User.build({
                userid: user,
                auth_type: auth_type,
                affiliation: affiliation,
                pwd: pwd,
                name: name,
                role: 'user'
            })
            return await userCreated.save();
        } catch (error) {
            throw Error(`Error save new user caused by: ${error.message}`)
        }
    }

    async createFieldPermit(userId, affiliation, refStructureName, companyName, fieldName, sectorname, thesis, permit){
        let model = this.FieldsPermit.build({
            userid: userId,
            affiliation: affiliation,
            refStructureName: refStructureName,
            companyName: companyName,
            fieldName: fieldName,
            sectorname: sectorname,
            thesis: thesis,
            permit: permit
        })
        this.FieldsPermit.removeAttribute('id')
        return await model.save()
    }

    async findFieldsByAffiliation(affiliation){
        try {
            this.TranscodingField.removeAttribute('id')
            const result = await this.TranscodingField.findAll({
                where: {source:affiliation}
            });

            const response = new Set();
            result.map(model => {
                const {
                    refStructureName,
                    companyName,
                    fieldName,
                    sectorname,
                    thesisname
                } = model;

                const key = `${refStructureName} - ${companyName} - ${fieldName} - ${sectorname} - ${thesisname}`;
                response.add(key)
            });

            return response;
        } catch (error) {
            console.error(`Error on finding transcoding fields for affiliation ${affiliation} caused by: ${error.message}`);
        }
    }

}

module.exports = UserRepository;