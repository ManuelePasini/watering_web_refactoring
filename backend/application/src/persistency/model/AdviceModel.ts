import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class AdviceModel extends Model<
  InferAttributes<AdviceModel>,
  InferCreationAttributes<AdviceModel>
> {
  declare thesisId: number;
  declare wateringStart: number;
  declare imageTimestamp: number | null;
  declare advice: number;
  declare duration: number | null;
  declare r: number | null;
  declare evapotranspiration: number | null;
  declare pluv: number | null;
  declare lastWatering: number | null;
}

export function initAdvice(sequelize: Sequelize): typeof AdviceModel {
  AdviceModel.init(
    {
      thesisId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "thesis_id",
        primaryKey: true,
      },
      wateringStart: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: "watering_start",
        primaryKey: true,
      },
      imageTimestamp: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "image_timestamp",
      },
      advice: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      duration: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      r: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      evapotranspiration: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      pluv: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      lastWatering: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "last_watering",
      },
    },
    {
      sequelize,
      tableName: "advices",
      modelName: "Advice",
      timestamps: false,
    }
  );

  return AdviceModel;
}

export default initAdvice;