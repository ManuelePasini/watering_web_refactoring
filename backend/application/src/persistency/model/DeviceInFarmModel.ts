import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class DeviceInFarmModel extends Model<
  InferAttributes<DeviceInFarmModel>,
  InferCreationAttributes<DeviceInFarmModel>
> {
  declare id: CreationOptional<number>;
  declare farmId: number;
  declare deviceId: number;
  declare validFrom: number;
  declare validTo: number | null;
}

export function initDeviceInFarm(
  sequelize: Sequelize
): typeof DeviceInFarmModel {
  DeviceInFarmModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      farmId: {
        type: DataTypes.INTEGER,
        field: "farm_id",
        allowNull: false,
      },
      deviceId: {
        type: DataTypes.INTEGER,
        field: "device_id",
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
      tableName: "farms_devices",
      modelName: "DeviceInFarm",
      timestamps: false,
      sequelize,
    }
  );

  return DeviceInFarmModel;
}

export default initDeviceInFarm;