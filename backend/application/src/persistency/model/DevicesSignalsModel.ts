import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class DevicesSignalsModel extends Model<
  InferAttributes<DevicesSignalsModel>,
  InferCreationAttributes<DevicesSignalsModel>
> {
  declare id: CreationOptional<number>;
  declare deviceId: number;
  declare signalId: number;
  declare validFrom: number | null;
  declare validTo: number | null;
}

export function initDevicesSignals(
  sequelize: Sequelize
): typeof DevicesSignalsModel {
  DevicesSignalsModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      deviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "device_id",
      },
      signalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "signal_id",
      },
      validFrom: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "valid_from",
      },
      validTo: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "valid_to",
      },
    },
    {
      tableName: "devices_signals",
      modelName: "DevicesSignals",
      timestamps: false,
      sequelize,
    }
  );

  return DevicesSignalsModel;
}

export default initDevicesSignals;