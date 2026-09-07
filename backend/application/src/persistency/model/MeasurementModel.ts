import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class MeasurementModel extends Model<
  InferAttributes<MeasurementModel>,
  InferCreationAttributes<MeasurementModel>
> {
  declare signalId: number;
  declare timestamp: number;
  declare computed: boolean | null;
  declare date: string | null;
  declare time: string | null;
  declare value: number | null;
  declare rawValue: string | null;
}

export function initMeasurement(
  sequelize: Sequelize
): typeof MeasurementModel {
  MeasurementModel.init(
    {
      signalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "signal_id",
        primaryKey: true,
      },
      timestamp: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: "timestamp",
        primaryKey: true,
      },
      computed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: "computed",
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: "date",
      },
      time: {
        type: DataTypes.TIME,
        allowNull: true,
        field: "time",
      },
      value: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "value",
      },
      rawValue: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "raw_value",
      },
    },
    {
      modelName: "Measurement",
      tableName: "measurements",
      timestamps: false,
      sequelize,
    }
  );

  return MeasurementModel;
}

export default initMeasurement;