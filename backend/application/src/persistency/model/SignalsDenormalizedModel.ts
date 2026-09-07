import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class SignalsDenormalizedModel extends Model<
  InferAttributes<SignalsDenormalizedModel>,
  InferCreationAttributes<SignalsDenormalizedModel>
> {
  declare signalId: number;
  declare signalDescription: string;
  declare signalType: string;
  declare signalTypeDescription: string;
  declare deviceId: number;
  declare deviceDescription: string;
  declare deviceType: string;
  declare deviceBinningId: number;
  declare x: number;
  declare y: number;
  declare z: number;
  declare virtual: boolean;
  declare unit: string;
  declare sensorTechnology: string;
  declare idOnProvider: string;
  declare providerId: number;
  declare validFrom: number;
  declare validTo: number;
}

export function initSignalsDenormalized(
  sequelize: Sequelize
): typeof SignalsDenormalizedModel {
  SignalsDenormalizedModel.init(
    {
      signalId: {
        type: DataTypes.INTEGER,
        field: "signal_id",
      },
      signalDescription: {
        type: DataTypes.TEXT,
        field: "signal_description",
      },
      signalType: {
        type: DataTypes.TEXT,
        field: "signal_type",
      },
      signalTypeDescription: {
        type: DataTypes.TEXT,
        field: "signal_type_description",
      },
      deviceId: {
        type: DataTypes.INTEGER,
        field: "device_id",
      },
      deviceDescription: {
        type: DataTypes.TEXT,
        field: "device_description",
      },
      deviceType: {
        type: DataTypes.TEXT,
        field: "device_type",
      },
      deviceBinningId: {
        type: DataTypes.INTEGER,
        field: "device_binning_id",
      },
      x: {
        type: DataTypes.DOUBLE,
        field: "x",
      },
      y: {
        type: DataTypes.DOUBLE,
        field: "y",
      },
      z: {
        type: DataTypes.DOUBLE,
        field: "z",
      },
      virtual: {
        type: DataTypes.BOOLEAN,
        field: "virtual",
      },
      unit: {
        type: DataTypes.TEXT,
        field: "unit",
      },
      sensorTechnology: {
        type: DataTypes.TEXT,
        field: "sensor_technology",
      },
      idOnProvider: {
        type: DataTypes.TEXT,
        field: "signal_id_on_provider",
      },
      providerId: {
        type: DataTypes.INTEGER,
        field: "provider_id",
      },
      validFrom: {
        type: DataTypes.DOUBLE,
        field: "valid_from",
      },
      validTo: {
        type: DataTypes.DOUBLE,
        field: "valid_to",
      },
    },
    {
      modelName: "SignalsDenormalized",
      tableName: "devices_signals_denormalized",
      timestamps: false,
      sequelize,
    }
  );

  return SignalsDenormalizedModel;
}

export default initSignalsDenormalized;