const hashPassword = require('../../commons/hashPassword')

class UserRepository {

    constructor(User, FieldsPermit, TranscodingField, sequelize) {
        this.User = User
        this.FieldsPermit = FieldsPermit
        this.TranscodingField = TranscodingField
        this.sequelize = sequelize

        User.hasMany(FieldsPermit, { foreignKey: 'userid' });
        FieldsPermit.belongsTo(User, { foreignKey: 'userid' });
    }

    findUser(user) {
        return this.User.findOne({where: {user:user}});
    }

    async findUserPermissions(user) {
        try {
            const userWithPermissions = await this.User.findOne({
                where: {user:user},
                include: [
                    {
                        model: this.FieldsPermit,
                    },
                ],
            });

            return userWithPermissions;
        } catch (error) {
            console.error('Error on find user:', error);
        }
    }

    async createUser(user, auth_type, affiliation, pwd, name) {
        let userCreated = this.User.build({user: user, auth_type: auth_type, affiliation: affiliation, pwd: pwd, name: name, role: 'user'})
        return await userCreated.save();
    }

    async createFieldPermit(userId, affiliation, refStructureName, companyName, fieldName, sectorName, thesis, permit){
        let model = this.FieldsPermit.build({
            userid: userId,
            affiliation: affiliation,
            refStructureName: refStructureName,
            companyName: companyName,
            fieldName: fieldName,
            sectorname: sectorName,
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