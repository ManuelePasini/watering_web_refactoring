import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class ServiceModel extends Model<
  InferAttributes<ServiceModel>,
  InferCreationAttributes<ServiceModel>
> {
  declare id: CreationOptional<number>;
  declare serviceName: string;
}

export function initService(sequelize: Sequelize): typeof ServiceModel {
  ServiceModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      serviceName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "service_name",
      },
    },
    {
      modelName: "Service",
      tableName: "services",
      timestamps: false,
      sequelize,
    }
  );

  return ServiceModel;
}

export default initService;