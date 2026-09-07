import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class WateringEventModel extends Model<
  InferAttributes<WateringEventModel>,
  InferCreationAttributes<WateringEventModel>
> {
  declare id: CreationOptional<number>;
  declare sectorId: number;
  declare date: string;
  declare wateringStart: number;
  declare wateringEnd: number | null;
  declare advice: number | null;
  declare duration: number | null;
  declare expectedWater: number | null;
  declare note: string | null;
  declare enabled: boolean;
  declare scheduled: boolean | null;
}

export function initWateringEvent(
  sequelize: Sequelize
): typeof WateringEventModel {
  WateringEventModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        field: "id",
        primaryKey: true,
        autoIncrement: true,
      },
      sectorId: {
        type: DataTypes.INTEGER,
        field: "sector_id",
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: "date",
      },
      wateringStart: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: "watering_start",
      },
      wateringEnd: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "watering_end",
      },
      advice: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "advice",
      },
      duration: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "duration",
      },
      expectedWater: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "expected_water",
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "note",
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: "enabled",
      },
      scheduled: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        field: "scheduled",
      },
    },
    {
      // Preserved from the original model.
      tableName: "watering_events",
      modelName: "WateringEvent",
      timestamps: false,
      sequelize,
    }
  );

  return WateringEventModel;
}

export default initWateringEvent;