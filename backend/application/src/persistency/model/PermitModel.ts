import { DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from "sequelize";

export class PermitModel extends Model<
  InferAttributes<PermitModel>,
  InferCreationAttributes<PermitModel>
> {
  declare id: number;
  declare table: string | null;
  declare role: string;
  declare idKey: number | null;
  declare userId: number;
  declare extraAttributes: Record<string, unknown> | null;
}

export function initPermit(sequelize: Sequelize): typeof PermitModel {
  PermitModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      table: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      role: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      idKey: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_key",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      extraAttributes: {
        type: DataTypes.JSONB,
        allowNull: true,
        field: "extra_attributes",
      },
    },
    {
      sequelize,
      tableName: "permits",
      modelName: "Permit",
      timestamps: false,
    }
  );

  return PermitModel;
}

export default initPermit;