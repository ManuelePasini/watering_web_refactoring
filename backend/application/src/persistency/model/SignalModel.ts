import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class SignalModel extends Model<
  InferAttributes<SignalModel>,
  InferCreationAttributes<SignalModel>
> {
  declare id: CreationOptional<number>;
  declare typeId: number;
  declare description: string | null;
  declare x: number | null;
  declare y: number | null;
  declare z: number | null;
  declare virtual: boolean | null;
  declare unit: string | null;
  declare providerId: number;
  declare idOnProvider: string | null;
  declare scalingFactor: CreationOptional<number | null>;
  declare scaledUnit: string | null;
  declare sensorTechnology: string | null;
  declare createdAt: number;
  declare disabledAt: number | null;
}

export function initSignal(sequelize: Sequelize): typeof SignalModel {
  SignalModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      typeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "type_id",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "description",
      },
      x: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "x",
      },
      y: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "y",
      },
      z: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "z",
      },
      virtual: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: "virtual",
      },
      unit: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "unit",
      },
      providerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "provider_id",
      },
      idOnProvider: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "id_on_provider",
      },
      scalingFactor: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "scaling_factor",
        defaultValue: 1,
      },
      scaledUnit: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "scaled_unit",
      },
      sensorTechnology: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "sensor_technology",
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
      tableName: "signals",
      modelName: "Signal",
      timestamps: false,
      sequelize,
    }
  );

  return SignalModel;
}

export default initSignal;