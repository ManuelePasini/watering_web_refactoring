const { Model, DataTypes } = require('sequelize')

class MatrixField extends Model {

}

function initMatrixField(sequelize) {

  MatrixField.init({
      matrixId: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      refStructureName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      companyName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fieldName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      plantRow: {
        type: DataTypes.STRING,
        allowNull: false
      },
      plantNum: {
        type: DataTypes.STRING,
        allowNull: false
      },
      timestamp_from: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      timestamp_to: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      current: {
        type: DataTypes.BOOLEAN,
        allowNull: false
      }
    }, {
      modelName: 'field_matrix',
      timestamps: false,
      sequelize
    }
  )

  return MatrixField
}

module.exports = initMatrixField