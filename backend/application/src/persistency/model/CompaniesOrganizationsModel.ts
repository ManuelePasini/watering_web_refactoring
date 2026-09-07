import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class CompaniesOrganizationsModel extends Model<
  InferAttributes<CompaniesOrganizationsModel>,
  InferCreationAttributes<CompaniesOrganizationsModel>
> {
  declare id: CreationOptional<number>;
  declare companyId: number;
  declare organizationId: number;
}

export function initCompaniesOrganizations(
  sequelize: Sequelize
): typeof CompaniesOrganizationsModel {
  CompaniesOrganizationsModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "company_id",
      },
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "organization_id",
      },
    },
    {
      tableName: "companies_organizations",
      modelName: "CompaniesOrganization",
      timestamps: false,
      sequelize,
    }
  );

  return CompaniesOrganizationsModel;
}

export default initCompaniesOrganizations;