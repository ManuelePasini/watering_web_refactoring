import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class OptimalProfileModel extends Model<
  InferAttributes<OptimalProfileModel>,
  InferCreationAttributes<OptimalProfileModel>
> {
  declare profileId: string;
  declare x: number;
  declare y: number;
  declare z: number;
  declare value: number;
  declare weight: number;
}

export function initOptimalProfile(
  sequelize: Sequelize
): typeof OptimalProfileModel {
  OptimalProfileModel.init(
    {
      profileId: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: "profile_id",
      },
      x: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      y: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      z: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      value: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      weight: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
    },
    {
      modelName: "OptimalProfile",
      tableName: "optimal_profiles",
      timestamps: false,
      sequelize,
    }
  );

  return OptimalProfileModel;
}

export default initOptimalProfile;