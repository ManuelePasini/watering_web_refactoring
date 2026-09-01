import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class CompanyModel extends Model<
  InferAttributes<CompanyModel>,
  InferCreationAttributes<CompanyModel>
> {
  declare id: CreationOptional<number>;
  declare companyName: string;
  declare address: string | null;
  declare createdAt: number;
  declare disabledAt: number | null;
}

export function initCompany(sequelize: Sequelize): typeof CompanyModel {
  CompanyModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      companyName: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: "company_name",
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "companies",
      modelName: "Company",
      timestamps: false,
      sequelize,
    }
  );

  return CompanyModel;
}

export default initCompany;