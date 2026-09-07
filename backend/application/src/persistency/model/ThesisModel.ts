import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class ThesisModel extends Model<
  InferAttributes<ThesisModel>,
  InferCreationAttributes<ThesisModel>
> {
  declare id: CreationOptional<number>;
  declare thesisName: string;
  declare createdAt: number;
  declare disabledAt: number | null;
}

export function initThesis(sequelize: Sequelize): typeof ThesisModel {
  ThesisModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      thesisName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "thesis_name",
      },
      createdAt: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: "created_at",
      },
      disabledAt: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "disabled_at",
      },
    },
    {
      tableName: "theses",
      modelName: "Thesis",
      timestamps: false,
      sequelize,
    }
  );

  return ThesisModel;
}

export default initThesis;