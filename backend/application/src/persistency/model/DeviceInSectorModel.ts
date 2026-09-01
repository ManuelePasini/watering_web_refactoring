import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class DeviceInSectorModel extends Model<
  InferAttributes<DeviceInSectorModel>,
  InferCreationAttributes<DeviceInSectorModel>
> {
  declare id: CreationOptional<number>;
  declare deviceId: number;
  declare sectorId: number;
  declare validFrom: number;
  declare validTo: number | null;
}

export function initDeviceInSector(
  sequelize: Sequelize
): typeof DeviceInSectorModel {
  DeviceInSectorModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      deviceId: {
        type: DataTypes.INTEGER,
        field: "device_id",
        allowNull: false,
      },
      sectorId: {
        type: DataTypes.INTEGER,
        field: "sector_id",
        allowNull: false,
      },
      validFrom: {
        type: DataTypes.DOUBLE,
        field: "valid_from",
        allowNull: false,
      },
      validTo: {
        type: DataTypes.DOUBLE,
        field: "valid_to",
        allowNull: true,
      },
    },
    {
      tableName: "sectors_devices",
      modelName: "DeviceInSector",
      timestamps: false,
      sequelize,
    }
  );

  return DeviceInSectorModel;
}

export default initDeviceInSector;