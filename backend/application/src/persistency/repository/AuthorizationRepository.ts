import { Op, QueryTypes, Sequelize } from "sequelize";
import {
    COMPANIES_PERMITS_COLUMN_MAPPING,
    DEVICE_PERMITS_COLUMN_MAPPING,
    Role,
} from "../../commons/permissionRoles.js";
import { TableName, TABLES } from "../../commons/constants.js";
import { _deleteFromModelByParams } from "../../commons/repositoryUtils.js";
import { UserModel } from "../model/UserModel.js";
import { Where } from "sequelize/lib/utils";
import { UserRole } from "../../dtos/userPermitsDto.js";
import { PermitModel } from "../model/PermitModel.js";
import { getErrorMessage } from "../../commons/utils.js";



interface AvailablePermissionRow {
    role: Role;
    idKey: number;
}

interface GrantExtraAttributes {
    [key: string]: unknown;
}

export interface UserRoles {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

type EntityType = TableName

class AuthorizationRepository {
    private readonly Permit: typeof PermitModel;
    private readonly User: typeof UserModel;
    private readonly sequelize: Sequelize;

    constructor(
        models,
        sequelize: Sequelize
    ) {
        this.Permit = models.Permit;
        this.User = models.User;
        this.sequelize = sequelize;
    }

    async getUserFieldAvailableIds(
        userId: number,
        entity: keyof typeof COMPANIES_PERMITS_COLUMN_MAPPING,
        service: string | null
    ): Promise<AvailablePermissionRow[]> {
        try {
            const column =
                COMPANIES_PERMITS_COLUMN_MAPPING[entity];

            const query = `
                SELECT DISTINCT
                    role,
                    ${column} AS "idKey"
                FROM master_data_permits
                WHERE user_id = :userId
                AND ${column} IS NOT NULL
                ${service != null ? `AND :service = ANY(services)` : ""}
            `;

            const results = await this.sequelize.query<AvailablePermissionRow>(
                query,
                {
                    replacements: {
                        userId,
                        service,
                    },
                    type: QueryTypes.SELECT,
                }
            );

            return results;
        } catch (error) {
            console.error(
                `Fail retrieving authorization data: ${getErrorMessage(error)}`
            );
            throw error;
        }
    }

    async getUserDeviceAvailableIds(
        userId: number,
        entity: keyof typeof DEVICE_PERMITS_COLUMN_MAPPING
    ): Promise<AvailablePermissionRow[]> {
        try {
            const column = DEVICE_PERMITS_COLUMN_MAPPING[entity];

            const query = `
                SELECT DISTINCT
                    role,
                    ${column} AS "idKey"
                FROM devices_signals_permits
                WHERE user_id = :userId
                AND ${column} IS NOT NULL
            `;

            const results = await this.sequelize.query<AvailablePermissionRow>(
                query,
                {
                    replacements: { userId },
                    type: QueryTypes.SELECT,
                }
            );

            return results;
        } catch (error) {
            console.error(
                `Fail retrieving authorization data: ${getErrorMessage(error)}`
            );
            throw error;
        }
    }

    async getUserFieldsRoles(
        userId: number,
        entity: keyof typeof COMPANIES_PERMITS_COLUMN_MAPPING | null,
        id: number | null,
        service: string | null
    ): Promise<UserRole[]> {
        try {
            const column =
                entity != null
                    ? COMPANIES_PERMITS_COLUMN_MAPPING[entity]
                    : null;

            const query = `
                SELECT DISTINCT role
                FROM master_data_permits
                WHERE user_id = :userId
                ${
                    column != null && id != null
                        ? `AND ${column} = :id`
                        : ""
                }
                ${
                    service != null
                        ? `AND :service = ANY(services)`
                        : ""
                }
            `;

            return await this.sequelize.query<UserRole>(query, {
                replacements: {
                    userId,
                    id,
                    service,
                },
                type: QueryTypes.SELECT,
            });
        } catch (error) {
            console.error(
                `Fail retrieving authorization data: ${getErrorMessage(error)}`
            );
            throw error;
        }
    }

    async getUserDeviceRoles(
        userId: number,
        entity: keyof typeof DEVICE_PERMITS_COLUMN_MAPPING,
        id: number | null
    ): Promise<UserRole[]> {
        try {
            const column = DEVICE_PERMITS_COLUMN_MAPPING[entity];

            const query = `
                SELECT DISTINCT role
                FROM devices_signals_permits
                WHERE user_id = :userId
                ${
                    id != null
                        ? `AND ${column} = :id`
                        : ""
                }
            `;

            return await this.sequelize.query<UserRole>(query, {
                replacements: {
                    userId,
                    id,
                },
                type: QueryTypes.SELECT,
            });
        } catch (error) {
            console.error(
                `Fail retrieving authorization data: ${getErrorMessage(error)}`
            );
            throw error;
        }
    }

    async grantUser(
        userId: number,
        entityType: EntityType,
        entityId: number,
        role: Role,
        extraAttributes: GrantExtraAttributes | null
    ): Promise<PermitModel> {
        try {
            const table = TABLES[entityType];

            const query = `
                SELECT *
                FROM ${table}
                WHERE id = :entityId
            `;

            const results = await this.sequelize.query(query, {
                replacements: { entityId },
                type: QueryTypes.SELECT,
            });

            if (results.length === 0) {
                throw new Error("Requested entity does not exist");
            }

            return await this.Permit.create({
                userId,
                table,
                idKey: entityId,
                role,
                extraAttributes,
            });
        } catch (error) {
            throw new Error(
                `Error saving new user permits caused by: ${getErrorMessage(error)}`
            );
        }
    }

    async removeOldPermits(
        userId: number,
        entityType: "COMPANY" | "SECTOR",
        entityId: number
    ): Promise<number[]> {
        try {
            let companyIds: number[] = [];
            let sectorIds: number[] = [];

            if (entityType === "COMPANY") {
                companyIds = [entityId];

                const sectorRows =
                    await this.sequelize.query<{sector_id: number}>(
                        `
                        SELECT DISTINCT "sector_id"
                        FROM master_data_permits
                        WHERE "user_id" = :userId
                        AND "company_id" = :companyId
                        AND "sector_id" IS NOT NULL
                        `,
                        {
                            replacements: {
                                userId,
                                companyId: entityId,
                            },
                            type: QueryTypes.SELECT,
                        }
                    );

                sectorIds = sectorRows.map(
                    row => row.sector_id
                );
            } else {
                sectorIds = [entityId];

                const companyRows =
                    await this.sequelize.query<{company_id: number}>(
                        `
                        SELECT DISTINCT "company_id"
                        FROM master_data_permits
                        WHERE "user_id" = :userId
                        AND "sector_id" = :sectorId
                        AND "company_id" IS NOT NULL
                        `,
                        {
                            replacements: {
                                userId,
                                sectorId: entityId,
                            },
                            type: QueryTypes.SELECT,
                        }
                    );

                companyIds = companyRows.map(
                    row => row.company_id
                );
            }

            const orConditions: object[] = [];

            if (companyIds.length > 0) {
                orConditions.push({
                    table: TABLES.COMPANY,
                    idKey: {
                        [Op.in]: companyIds,
                    },
                });
            }

            if (sectorIds.length > 0) {
                orConditions.push({
                    table: TABLES.SECTOR,
                    idKey: {
                        [Op.in]: sectorIds,
                    },
                });
            }

            return await _deleteFromModelByParams(
                this.Permit,
                {
                    userId,
                    [Op.or]: orConditions,
                } as unknown as Where
            );
        } catch (error) {
            throw new Error(
                `Error saving new user permits caused by: ${getErrorMessage(error)}`
            );
        }
    }

    async getResourceRelatedPermissions(
        entityType: EntityType,
        entityId: number
    ): Promise<PermitModel[]> {
        return await this.Permit.findAll({
            attributes: [
                "role",
                "extraAttributes",
            ],
            group: ["role", "extraAttributes", "user.id", "user.name", "user.email"],
            where: {
                table: TABLES[entityType],
                idKey: entityId,
            },
            include: [
                {
                    model: this.User,
                    required: true,
                    attributes: [
                        "id",
                        "name",
                        "email",
                    ],
                    as: "user",
                },
            ],
        });
    }

    async getCompanyUsers(
        companyId: number
    ): Promise<UserRoles[]> {
        try {
            const query = `
                SELECT
                    u.id,
                    u.name,
                    u.email,
                    ARRAY_AGG(DISTINCT p.role) AS roles
                FROM master_data_permits p
                JOIN users u
                    ON p.user_id = u.id
                WHERE "company_id" = :companyId
                GROUP BY
                    u.id,
                    u.name,
                    u.email
            `;

            return await this.sequelize.query<UserRoles>(
                query,
                {
                    replacements: { companyId },
                    type: QueryTypes.SELECT,
                }
            );
        } catch (error) {
            console.error(
                `Fail retrieving company users: ${getErrorMessage(error)}`
            );
            throw error;
        }
    }
}

export default AuthorizationRepository;