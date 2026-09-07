import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { ServiceModel } from "./ServiceModel.js";

export class SectorServicesModel extends Model<
  InferAttributes<SectorServicesModel>,
  InferCreationAttributes<SectorServicesModel>
> {
  declare id: CreationOptional<number>;
  declare sectorId: number;
  declare serviceId: number;
  declare validFrom: number;
  declare validTo: number | null;
  declare service?: ServiceModel;
}

export function initSectorServices(
  sequelize: Sequelize
): typeof SectorServicesModel {
  SectorServicesModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      sectorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "sector_id",
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "service_id",
      },
      validFrom: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: "valid_from",
      },
      validTo: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "valid_to",
      },
    },
    {
      modelName: "SectorServices",
      tableName: "sectors_services",
      timestamps: false,
      sequelize,
    }
  );

  return SectorServicesModel;
}

export default initSectorServices;