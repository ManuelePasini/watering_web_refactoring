import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { GeoJsonGeometry } from "../../commons/utils.js";

export class SectorModel extends Model<
  InferAttributes<SectorModel>,
  InferCreationAttributes<SectorModel>
> {
  declare id: CreationOptional<number>;
  declare sectorName: string;
  declare farmId: number;
  declare culture: string;
  declare cultureType: string | null;
  declare location: GeoJsonGeometry | null;
  declare dripperCapacity: number | null;
  declare sprinklerCapacity: number | null;
  declare doubleWing: boolean | null;
  declare createdAt: number;
  declare disabledAt: number | null;
}

export function initSector(sequelize: Sequelize): typeof SectorModel {
  SectorModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sectorName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "sector_name",
      },
      farmId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "farm_id",
      },
      culture: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      cultureType: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "culture_type",
      },
      location: {
        type: DataTypes.GEOMETRY,
        allowNull: true,
      },
      dripperCapacity: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "dripper_capacity",
      },
      sprinklerCapacity: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "sprinkler_capacity",
      },
      doubleWing: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: "double_wing",
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
      modelName: "Sector",
      tableName: "sectors",
      timestamps: false,
      sequelize,
    }
  );

  return SectorModel;
}

export default initSector;