import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { DeviceModel } from "./DeviceModel.js";

export class DeviceInThesisModel extends Model<
  InferAttributes<DeviceInThesisModel>,
  InferCreationAttributes<DeviceInThesisModel>
> {
  declare id: CreationOptional<number>;
  declare deviceId: number;
  declare thesisId: number;
  declare validFrom: number;
  declare validTo: number | null;
  declare device?: DeviceModel;
}

export function initDeviceInThesis(
  sequelize: Sequelize
): typeof DeviceInThesisModel {
  DeviceInThesisModel.init(
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
      thesisId: {
        type: DataTypes.INTEGER,
        field: "thesis_id",
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
      tableName: "theses_devices",
      modelName: "DeviceInThesis",
      timestamps: false,
      sequelize,
    }
  );

  return DeviceInThesisModel;
}

export default initDeviceInThesis;