import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { GeoJsonGeometry } from "../../commons/utils.js";

export class FarmModel extends Model<
  InferAttributes<FarmModel>,
  InferCreationAttributes<FarmModel>
> {
  declare id: CreationOptional<number>;
  declare farmName: string;
  declare companyId: number;
  declare location: GeoJsonGeometry | null;
  declare createdAt: number;
  declare disabledAt: number | null;
}

export function initFarm(sequelize: Sequelize): typeof FarmModel {
  FarmModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      farmName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "farm_name",
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "company_id",
      },
      location: {
        type: DataTypes.GEOMETRY,
        allowNull: true,
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
      tableName: "farms",
      modelName: "Farm",
      timestamps: false,
      sequelize,
    }
  );

  return FarmModel;
}

export default initFarm;