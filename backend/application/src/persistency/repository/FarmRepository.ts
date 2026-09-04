import {
    Op,
    QueryTypes,
    Sequelize,
} from "sequelize";

import { _deleteFromModelByParams } from "../../commons/repositoryUtils.js";
import { CompanyModel } from "../model/CompanyModel.js";
import { FarmModel } from "../model/FarmModel.js";
import { SectorModel } from "../model/SectorModel.js";
import { GeoJsonGeometry, getErrorMessage } from "../../commons/utils.js";
import { Farm } from "../../dtos/farmDto.js";


interface FarmRepositoryModels {
    Company: typeof CompanyModel;
    Farm: typeof FarmModel;
    Sector: typeof SectorModel;
}

export interface FarmDetails {
    companyId: number;
    companyName: string;
    id: number;
    farmName: string;
    location: GeoJsonGeometry;
    sectors: Array<{
        id: number;
        sectorName: string;
        createdAt: number;
        disabledAt: number | null;
    }> | null;
    createdAt: number;
    disabledAt: number | null;
}

class FarmRepository {
    private readonly Company: typeof CompanyModel;
    private readonly Farm: typeof FarmModel;
    private readonly sequelize: Sequelize;

    constructor(
        models: FarmRepositoryModels,
        sequelize: Sequelize,
    ) {
        this.Company = models.Company;
        this.Farm = models.Farm;
        this.sequelize = sequelize;
    }

    async farmExists(farmId: number): Promise<boolean> {
        const count = await this.Farm.count({
            where: {
                id: farmId,
            },
        });

        return count > 0;
    }

    async getFarms(
        filteringIds: number[] | null,
        timeFilterFrom: number,
        timeFilterTo: number,
    ): Promise<FarmModel[]> {
        try {
            const where = {
                createdAt: {
                    [Op.lt]: timeFilterTo,
                },
                [Op.or]: [
                    {
                        disabledAt: {
                            [Op.gt]: timeFilterFrom,
                        },
                    },
                    {
                        disabledAt: {
                            [Op.is]: null,
                        },
                    },
                ],
                ...(Array.isArray(filteringIds)
                    ? filteringIds.length > 0
                        ? {
                              id: {
                                  [Op.in]: filteringIds,
                              },
                          }
                        : null
                    : {}),
            };

            if (Array.isArray(filteringIds) && filteringIds.length === 0) {
                return [];
            }

            return await this.Farm.findAll({
                where,
            });
        } catch (error) {
            throw new Error(
                `Error retrieving farms caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async createFarm(
        farmName: string,
        companyId: number,
        location: GeoJsonGeometry,
        createdAt: number,
    ): Promise<FarmModel> {
        try {
            const company = await this.Company.findByPk(companyId);

            if (!company) {
                throw new Error(
                    `Company with ID ${companyId} does not exist.`,
                );
            }

            return await this.Farm.create({
                farmName,
                companyId,
                location,
                createdAt,
            });
        } catch (error) {
            throw new Error(
                `Error creating new farm caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async getFarmDetails(
        farmId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
        userId: number,
        isAdmin: boolean,
    ): Promise<FarmDetails | undefined> {
        try {
            const query = `
                SELECT
                    c.id AS "companyId",
                    c.company_name AS "companyName",
                    f.id,
                    f.farm_name AS "farmName",
                    f.location,
                    f.created_at AS "createdAt",
                    f.disabled_at AS "disabledAt",
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', s.id,
                            'sectorName', s.sector_name,
                            'createdAt', s.created_at,
                            'disabledAt', s.disabled_at
                        )
                    ) FILTER (WHERE s.id IS NOT NULL) AS sectors

                FROM farms f

                JOIN companies c
                    ON f.company_id = c.id

                LEFT JOIN (
                    SELECT DISTINCT
                        company_id,
                        farm_id,
                        sector_id
                    FROM master_data_permits
                    WHERE user_id = :userId
                ) p
                    ON p.company_id = c.id
                    AND p.farm_id = f.id

                LEFT JOIN sectors s
                    ON s.farm_id = f.id
                    AND s.created_at < :timeFilterTo
                    AND (
                        s.disabled_at > :timeFilterFrom
                        OR s.disabled_at IS NULL
                    )
                    AND (
                        p.sector_id = s.id
                        OR :isAdmin = true
                    )

                WHERE f.id = :farmId
                    AND (
                        :isAdmin = true
                        OR p.farm_id IS NOT NULL
                    )

                GROUP BY
                    c.id,
                    c.company_name,
                    f.id,
                    f.farm_name,
                    f.location
            `;

            const results = await this.sequelize.query<FarmDetails>(
                query,
                {
                    replacements: {
                        userId,
                        farmId,
                        isAdmin,
                        timeFilterFrom,
                        timeFilterTo,
                    },
                    type: QueryTypes.SELECT,
                },
            );

            return results[0];
        } catch (error) {
            throw new Error(
                `Error retrieving farm details: ${getErrorMessage(error)}`,
            );
        }
    }

    async getFarmsByCompany(
        companyId: number,
    ): Promise<FarmModel[]> {
        return await this.Farm.findAll({
            where: {
                companyId,
            },
        });
    }

    async updateFarm(
        farmId: number,
        updates: Farm,
    ): Promise<FarmModel> {
        try {
            const farm = await this.Farm.findByPk(farmId);

            if (!farm) {
                throw new Error("Farm not found");
            }

            const {
                name,
                location,
            } = updates;

            return await farm.update({
                farmName: name,
                location,
            });
        } catch (error) {
            throw new Error(
                `Error while updating farm caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async disableFarm(
        farmId: number,
        timestamp: number,
    ): Promise<void> {
        try {
            await this.Farm.update(
                {
                    disabledAt: timestamp,
                },
                {
                    where: {
                        id: farmId,
                        disabledAt: {
                            [Op.is]: null,
                        },
                    },
                },
            );
        } catch (error) {
            throw new Error(
                `Error while disabling farm caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteFarm(
        farmId: number,
    ): Promise<number[]> {
        try {
            return await _deleteFromModelByParams(
                this.Farm,
                {
                    id: farmId,
                },
            );
        } catch (error) {
            throw new Error(
                `Error deleting farm: ${getErrorMessage(error)}`,
            );
        }
    }
}

export default FarmRepository;