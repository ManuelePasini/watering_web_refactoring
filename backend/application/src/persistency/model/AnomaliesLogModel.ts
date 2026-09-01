import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class AnomaliesLogModel extends Model<
  InferAttributes<AnomaliesLogModel>,
  InferCreationAttributes<AnomaliesLogModel>
> {
  declare table: string;
  declare idKey: number | null;
  declare timestamp: number;
  declare agent: string;
  declare type: string;
  declare description: string | null;
}

export function initAnomaliesLog(
  sequelize: Sequelize
): typeof AnomaliesLogModel {
  AnomaliesLogModel.init(
    {
      table: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      idKey: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "id_key",
      },
      timestamp: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      agent: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "anomalies_logs",
      timestamps: false,
      sequelize,
    }
  );

  return AnomaliesLogModel;
}

export default initAnomaliesLog;