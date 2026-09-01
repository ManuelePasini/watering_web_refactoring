import { Model, DataTypes } from 'sequelize';

export class CompanyModel extends Model {

}

function initCompany(sequelize) {
    CompanyModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        companyName: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "company_name"
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            field: "created_at"
        },
        disabledAt: {
            type: DataTypes.DOUBLE,
            allowNull: true,
            field: "disabled_at"
        }
    }, {
        tableName : 'companies',
        modelName : 'Company',
        timestamps : false,
        sequelize
    });

    return CompanyModel;
}

export default initCompany;