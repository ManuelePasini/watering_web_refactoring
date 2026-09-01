import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class WateringAlgorithmParamsModel extends Model<
  InferAttributes<WateringAlgorithmParamsModel>,
  InferCreationAttributes<WateringAlgorithmParamsModel>
> {
  declare thesisId: number;
  declare minWatering: number | null;
  declare maxWatering: number | null;
  declare wateringBaseline: number | null;
  declare wateringFrequency: number | null;
  declare ki: number | null;
  declare kp: number | null;
  declare description: string | null;
  declare validFrom: number;
  declare validTo: number | null;
  declare errorFunction: string | null;
}

export function initWateringAlgorithmParams(
  sequelize: Sequelize
): typeof WateringAlgorithmParamsModel {
  WateringAlgorithmParamsModel.init(
    {
      thesisId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "thesis_id",
      },
      minWatering: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "min_watering",
      },
      maxWatering: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "max_watering",
      },
      wateringBaseline: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "watering_baseline",
      },
      wateringFrequency: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "watering_frequency",
      },
      ki: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      kp: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      errorFunction: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "error_function",
      },
    },
    {
      tableName: "watering_algorithm_params",
      modelName: "WateringAlgorithmParams",
      timestamps: false,
      sequelize,
    }
  );

  return WateringAlgorithmParamsModel;
}

export default initWateringAlgorithmParams;