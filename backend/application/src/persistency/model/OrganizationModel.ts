import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class OrganizationModel extends Model<
  InferAttributes<OrganizationModel>,
  InferCreationAttributes<OrganizationModel>
> {
  declare id: CreationOptional<number>;
  declare organizationName: string;
}

export function initOrganization(
  sequelize: Sequelize
): typeof OrganizationModel {
  OrganizationModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      organizationName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "organization_name",
      },
    },
    {
      modelName: "Organization",
      tableName: "organizations",
      timestamps: false,
      sequelize,
    }
  );

  return OrganizationModel;
}

export default initOrganization;