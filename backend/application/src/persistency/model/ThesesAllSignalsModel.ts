import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class ThesesAllSignalsModel extends Model<
  InferAttributes<ThesesAllSignalsModel>,
  InferCreationAttributes<ThesesAllSignalsModel>
> {
  declare companyId: number;
  declare companyName: string;
  declare farmId: number;
  declare farmName: string;
  declare sectorId: number;
  declare sectorName: string;
  declare thesisId: number;
  declare thesisName: string;
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
  declare validFrom: number;
  declare validTo: number;
  declare associationType: string;
}

export function initThesesAllSignals(
  sequelize: Sequelize
): typeof ThesesAllSignalsModel {
  ThesesAllSignalsModel.init(
    {
      companyId: {
        type: DataTypes.INTEGER,
        field: "company_id",
      },
      companyName: {
        type: DataTypes.TEXT,
        field: "company_name",
      },
      farmId: {
        type: DataTypes.INTEGER,
        field: "farm_id",
      },
      farmName: {
        type: DataTypes.TEXT,
        field: "farm_name",
      },
      sectorId: {
        type: DataTypes.INTEGER,
        field: "sector_id",
      },
      sectorName: {
        type: DataTypes.TEXT,
        field: "sector_name",
      },
      thesisId: {
        type: DataTypes.INTEGER,
        field: "thesis_id",
      },
      thesisName: {
        type: DataTypes.TEXT,
        field: "thesis_name",
      },
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
      validFrom: {
        type: DataTypes.DOUBLE,
        field: "valid_from",
      },
      validTo: {
        type: DataTypes.DOUBLE,
        field: "valid_to",
      },
      associationType: {
        type: DataTypes.TEXT,
        field: "association_type",
      },
    },
    {
      modelName: "ThesesAllSignals",
      tableName: "theses_all_signals",
      timestamps: false,
      sequelize,
    }
  );

  return ThesesAllSignalsModel;
}

export default initThesesAllSignals;