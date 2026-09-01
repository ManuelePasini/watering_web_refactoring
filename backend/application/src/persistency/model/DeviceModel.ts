import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export interface DeviceLocation {
  type: "Point";
  coordinates: [number, number];
}

export class DeviceModel extends Model<
  InferAttributes<DeviceModel>,
  InferCreationAttributes<DeviceModel>
> {
  declare id: CreationOptional<number>;
  declare type: string;
  declare description: string | null;
  declare location: DeviceLocation | null;
  declare binningId: number | null;
  declare companyId: number | null;
  declare createdAt: number;
  declare disabledAt: number | null;
}

export function initDevice(sequelize: Sequelize): typeof DeviceModel {
  DeviceModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      type: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "type",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "description",
      },
      location: {
        type: DataTypes.GEOMETRY,
        allowNull: true,
        field: "location",
      },
      binningId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "binning_id",
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "company_id",
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
      tableName: "devices",
      modelName: "Device",
      timestamps: false,
      sequelize,
    }
  );

  return DeviceModel;
}

export default initDevice;