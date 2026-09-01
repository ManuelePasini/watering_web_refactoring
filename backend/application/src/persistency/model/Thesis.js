import { Model, DataTypes } from 'sequelize';

export class ThesisModel extends Model {

}

function initThesis(sequelize) {
    ThesisModel.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        thesisName: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "thesis_name"
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
        tableName : 'theses',
        modelName : 'Thesis',
        timestamps : false,
        sequelize
    });

    return ThesisModel;
}

export default initThesis;