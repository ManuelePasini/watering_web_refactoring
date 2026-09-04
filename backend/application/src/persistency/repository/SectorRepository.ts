import { Op, QueryTypes, Sequelize } from "sequelize";
import { _deleteFromModelByParams } from "../../commons/repositoryUtils.js";
import { Sector } from "../../dtos/sectorDto.js";
import { GeoJsonGeometry, getErrorMessage } from "../../commons/utils.js";
import { ThesisInSectorModel } from "../model/ThesisInSectorModel.js";
import { ThesisModel } from "../model/ThesisModel.js";
import { SectorModel } from "../model/SectorModel.js";
import { FarmModel } from "../model/FarmModel.js";
import { CompanyModel } from "../model/CompanyModel.js";

export interface SectorResult {
    companyId: number;
    companyName: string;
    farmId: number;
    farmName: string;
    sectorId: number;
    sectorName: string;
    culture: string | null;
    cultureType: string | null;
    location: GeoJsonGeometry;
    createdAt: number;
    disabledAt: number | null;
}

class SectorRepository {
    private readonly Company: typeof CompanyModel;
    private readonly Farm: typeof FarmModel;
    private readonly Thesis: typeof ThesisModel;
    private readonly ThesisInSector: typeof ThesisInSectorModel;
    private readonly sequelize: Sequelize;

    constructor(
        models: {
            Company: typeof CompanyModel;
            Farm: typeof FarmModel;
            Thesis: typeof ThesisModel;
            ThesisInSector: typeof ThesisInSectorModel;
        },
        sequelize: Sequelize,
    ) {
        this.Company = models.Company;
        this.Farm = models.Farm;
        this.Thesis = models.Thesis;
        this.ThesisInSector = models.ThesisInSector;
        this.sequelize = sequelize;
    }

    async sectorExists(sectorId: number): Promise<boolean> {
        const count = await SectorModel.count({
            where: { id: sectorId },
        });

        return count > 0;
    }

    async createSector({
        name,
        farmId,
        culture,
        cultureType,
        location,
        dripperCapacity,
        sprinklerCapacity,
        doubleWing,
        createdAt,
    }: Sector): Promise<SectorModel> {
        try {
            const farm = await FarmModel.findByPk(farmId);

            if (!farm) {
                throw new Error(`Farm with ID ${farmId} does not exist.`);
            }

            return await SectorModel.create({
                sectorName: name,
                farmId,
                culture,
                cultureType,
                location,
                dripperCapacity,
                sprinklerCapacity,
                doubleWing,
                createdAt,
            });
        } catch (error) {
            throw new Error(
                `Error creating new sector caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async getSectorDetails(
        sectorId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
    ): Promise<SectorModel & { farm: FarmModel & { company: CompanyModel }, thesisInSector: (ThesisInSectorModel & { thesis: ThesisModel })[] }> {
        const sector = await SectorModel.findByPk(sectorId, {
            attributes: [
                "id",
                "sectorName",
                "culture",
                "cultureType",
                "farmId",
                "location",
                "dripperCapacity",
                "sprinklerCapacity",
                "doubleWing",
                "createdAt",
                "disabledAt",
            ],
            include: [
                {
                    model: this.Farm,
                    as: "farm",
                    attributes: ["farmName", "location", "companyId"],
                    include: [
                        {
                            model: this.Company,
                            as: "company",
                            attributes: ["companyName"],
                        },
                    ],
                },
                {
                    model: this.ThesisInSector,
                    as: "thesisInSector",
                    attributes: [
                        "thesisId",
                        "weight",
                        "validFrom",
                        "validTo",
                    ],
                    required: false,
                    include: [
                        {
                            model: this.Thesis,
                            as: "thesis",
                            attributes: ["thesisName"],
                        },
                    ],
                    where: {
                        validFrom: {
                            [Op.lt]: timeFilterTo,
                        },
                        validTo: {
                            [Op.or]: [
                                { [Op.is]: null },
                                { [Op.gt]: timeFilterFrom },
                            ],
                        },
                    },
                },
            ],
        });

        if (!sector) {
            throw new Error(`Sector with id ${sectorId} not found`);
        }

        return sector.toJSON();
    }

    async getSectors(
        filteringIds: number[] | null,
        timeFilterFrom: number,
        timeFilterTo: number,
    ): Promise<SectorResult[]> {
        const query = `
            SELECT DISTINCT
                c.id AS "companyId",
                c.company_name AS "companyName",
                f.id AS "farmId",
                f.farm_name AS "farmName",
                s.id AS "sectorId",
                s.sector_name AS "sectorName",
                s.culture AS "culture",
                s.culture_type AS "cultureType",
                s.location AS "location",
                s.created_at AS "createdAt",
                s.disabled_at AS "disabledAt"
            FROM sectors s
            JOIN farms f
                ON f.id = s.farm_id
            JOIN companies c
                ON c.id = f.company_id
            LEFT JOIN theses_in_sectors ts
                ON ts.sector_id = s.id
                AND (ts.valid_from IS NULL OR ts.valid_from <= :timeFilterTo)
                AND (ts.valid_to IS NULL OR ts.valid_to >= :timeFilterFrom)
            WHERE ${filteringIds === null
                ? "TRUE"
                : filteringIds.length === 0
                    ? "FALSE"
                    : "s.id = ANY(ARRAY[:filteringIds]::int[])"
            }
                AND s.created_at < :timeFilterTo
                AND (s.disabled_at > :timeFilterFrom OR s.disabled_at IS NULL)
            ORDER BY "companyName", "farmName", "sectorName";
        `;

        return await this.sequelize.query<SectorResult>(query, {
            replacements: {
                filteringIds,
                timeFilterFrom,
                timeFilterTo,
            },
            type: QueryTypes.SELECT,
        });
    }

    async getSectorsByFarm(
        farmId: number,
    ): Promise<InstanceType<typeof SectorModel>[]> {
        return await SectorModel.findAll({
            where: {
                farmId,
            },
        });
    }

    async updateSector(
        sectorId: number,
        updates: Sector,
    ): Promise<SectorModel> {
        try {
            const sector = await SectorModel.findByPk(sectorId);

            if (!sector) {
                throw new Error("Sector not found");
            }

            const {
                name,
                culture,
                cultureType,
                location,
                dripperCapacity,
                sprinklerCapacity,
                doubleWing,
            } = updates;

            return await sector.update({
                sectorName: name,
                culture,
                cultureType,
                location,
                dripperCapacity,
                sprinklerCapacity,
                doubleWing,
            });
        } catch (error) {
            throw new Error(
                `Error while updating sector caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async disableSector(
        sectorId: number,
        validTo: number,
    ): Promise<void> {
        try {
            await SectorModel.update(
                {
                    disabledAt: validTo,
                },
                {
                    where: {
                        id: sectorId,
                        disabledAt: {
                            [Op.is]: null,
                        },
                    },
                },
            );
        } catch (error) {
            throw new Error(
                `Error while disabling sector caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteSector(sectorId: number) {
        try {
            return await _deleteFromModelByParams(
                SectorModel,
                { id: sectorId },
            );
        } catch (error) {
            throw new Error(
                `Error deleting sector: ${getErrorMessage(error)}`,
            );
        }
    }

    async assignThesisToSector(
        thesisId: number,
        sectorId: number,
        weight: number,
        validFrom: number,
        validTo?: number,
    ): Promise<number> {
        const model = await ThesisInSectorModel.create({
            thesisId,
            sectorId,
            weight,
            validFrom,
            validTo,
        });
        return model.id;
    }
}

export default SectorRepository;