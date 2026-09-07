import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class UserActionModel extends Model<
  InferAttributes<UserActionModel>,
  InferCreationAttributes<UserActionModel>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare action: string;
  declare table: string;
  declare idKey: number;
  declare timestamp: number;
  declare description: string | null;
  declare payload: Record<string, unknown> | null;
}

export function initUserAction(
  sequelize: Sequelize
): typeof UserActionModel {
  UserActionModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      action: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      table: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      idKey: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: "id_key",
      },
      timestamp: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      payload: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      tableName: "users_actions",
      modelName: "UserAction",
      timestamps: false,
      sequelize,
    }
  );

  return UserActionModel;
}

export default initUserAction;