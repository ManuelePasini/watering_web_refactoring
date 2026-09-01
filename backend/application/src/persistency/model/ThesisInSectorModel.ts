import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

export class ThesisInSectorModel extends Model<
  InferAttributes<ThesisInSectorModel>,
  InferCreationAttributes<ThesisInSectorModel>
> {
  declare id: CreationOptional<number>;
  declare thesisId: number;
  declare sectorId: number;
  declare validFrom: number;
  declare validTo: number | null;
  declare weight: number | null;
}

export function initThesisInSector(
  sequelize: Sequelize
): typeof ThesisInSectorModel {
  ThesisInSectorModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      thesisId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "thesis_id",
      },
      sectorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "sector_id",
      },
      validFrom: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        field: "valid_from",
      },
      validTo: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        field: "valid_to",
      },
      weight: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
    },
    {
      tableName: "theses_in_sectors",
      modelName: "ThesisInSector",
      timestamps: false,
      sequelize,
    }
  );

  return ThesisInSectorModel;
}

export default initThesisInSector;