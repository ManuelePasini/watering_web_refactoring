import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class ProviderModel extends Model<
  InferAttributes<ProviderModel>,
  InferCreationAttributes<ProviderModel>
> {
  declare id: CreationOptional<number>;
  declare name: string;
}

export function initProvider(sequelize: Sequelize): typeof ProviderModel {
  ProviderModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "provider_name",
      },
    },
    {
      tableName: "providers",
      modelName: "Provider",
      timestamps: false,
      sequelize,
    }
  );

  return ProviderModel;
}

export default initProvider;