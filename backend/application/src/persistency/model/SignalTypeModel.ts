import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class SignalTypeModel extends Model<
  InferAttributes<SignalTypeModel>,
  InferCreationAttributes<SignalTypeModel>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare description: string | null;
}

export function initSignalType(
  sequelize: Sequelize
): typeof SignalTypeModel {
  SignalTypeModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "type",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "type_description",
      },
    },
    {
      modelName: "SignalType",
      tableName: "signal_types",
      timestamps: false,
      sequelize,
    }
  );

  return SignalTypeModel;
}

export default initSignalType;