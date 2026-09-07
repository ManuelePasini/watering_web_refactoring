import { Op, QueryTypes, Sequelize } from "sequelize";
import { _deleteFromModelByParams } from "../../commons/repositoryUtils.js";

import { CompanyModel } from "../model/CompanyModel.js";
import { OrganizationModel } from "../model/OrganizationModel.js";
import { CompaniesOrganizationsModel } from "../model/CompaniesOrganizationsModel.js";
import { Company, CompanyData } from "../../dtos/companyDto.js";
import { getErrorMessage } from "../../commons/utils.js";

class CompanyRepository {
    private readonly Company: typeof CompanyModel;
    private readonly Organization: typeof OrganizationModel;
    private readonly CompaniesOrganizations: typeof CompaniesOrganizationsModel;
    private readonly sequelize: Sequelize;

    constructor(
        models: any,
        sequelize: Sequelize
    ) {
        this.Company = models.Company;
        this.Organization = models.Organization;
        this.CompaniesOrganizations = models.CompaniesOrganizations;
        this.sequelize = sequelize;
    }

    async companyExists(companyId: number): Promise<boolean> {
        const count = await this.Company.count({
            where: {
                id: companyId,
            },
        });

        return count > 0;
    }

    async createCompany(
        companyName: string,
        address: string,
        organizationIds: number[] = [],
        createdAt: number
    ): Promise<CompanyModel> {
        try {
            for (const organizationId of organizationIds) {
                const organization =
                    await this.Organization.findByPk(organizationId);

                if (!organization) {
                    throw new Error(
                        `Organization with ID ${organizationId} does not exist.`
                    );
                }
            }

            const companyCreated = await this.Company.create({
                companyName,
                address,
                createdAt,
            });

            for (const organizationId of organizationIds) {
                await this.CompaniesOrganizations.create({
                    companyId: companyCreated.id,
                    organizationId,
                });
            }

            return companyCreated;
        } catch (error) {
            throw new Error(
                `Error creating new company caused by: ${getErrorMessage(error)}`
            );
        }
    }

    async getCompanyDetails(
        companyId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
        userId: number,
        isAdmin: boolean
    ): Promise<CompanyData> {
        try {
            const query = `
                SELECT
                    c.id,
                    c.company_name AS "name",
                    c.address,
                    c.created_at AS "createdAt",
                    c.disabled_at AS "disabledAt",

                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', o.id,
                            'name', o.organization_name
                        )
                    ) FILTER (
                        WHERE o.id IS NOT NULL
                    ) AS organizations,

                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', f.id,
                            'name', f.farm_name,
                            'createdAt', f.created_at,
                            'disabledAt', f.disabled_at
                        )
                    ) FILTER (
                        WHERE f.id IS NOT NULL
                    ) AS farms

                FROM companies c

                LEFT JOIN (
                    SELECT DISTINCT company_id, farm_id
                    FROM master_data_permits
                    WHERE user_id = :userId
                ) p ON p.company_id = c.id

                LEFT JOIN farms f
                    ON f.company_id = c.id
                    AND f.created_at < :timeFilterTo
                    AND (
                        f.disabled_at > :timeFilterFrom
                        OR f.disabled_at IS NULL
                    )
                    AND (
                        p.farm_id = f.id
                        OR :isAdmin = true
                    )

                LEFT JOIN companies_organizations co
                    ON co.company_id = c.id

                LEFT JOIN organizations o
                    ON o.id = co.organization_id

                WHERE c.id = :companyId
                    AND (
                        :isAdmin = true
                        OR p.company_id IS NOT NULL
                    )

                GROUP BY
                    c.id,
                    c.company_name,
                    c.address,
                    c.created_at,
                    c.disabled_at
            `;

            const results =
                await this.sequelize.query<CompanyData>(
                    query,
                    {
                        replacements: {
                            userId,
                            timeFilterFrom,
                            timeFilterTo,
                            companyId,
                            isAdmin,
                        },
                        type: QueryTypes.SELECT,
                    }
                );

            return results[0];
        } catch (error) {
            throw new Error(
                `Error retrieving company details caused by: ${getErrorMessage(error)}`
            );
        }
    }

    /**
     * Returns companies filtered by given ids.
     *
     * - null -> all companies
     * - []   -> no companies
     * - [...] -> companies with those ids
     */
    async getCompanies(
        filteringIds: number[] | null,
        timeFilterFrom: number,
        timeFilterTo: number
    ): Promise<CompanyModel[]> {
        try {
            const where = {
                createdAt: {
                    [Op.lt]: timeFilterTo,
                },
                disabledAt: {
                    [Op.or]: {
                        [Op.gt]: timeFilterFrom,
                        [Op.is]: null,
                    },
                },
                ...(filteringIds !== null
                    ? filteringIds.length > 0
                        ? {
                              id: {
                                  [Op.in]: filteringIds,
                              },
                          }
                        : null
                    : {}),
            };

            if (filteringIds !== null && filteringIds.length === 0) {
                return [];
            }

            return await this.Company.findAll({
                where,
            });
        } catch (error) {
            throw new Error(
                `Error retrieving companies caused by: ${getErrorMessage(error)}`
            );
        }
    }

    async updateCompany(
        companyId: number,
        updates: Company
    ): Promise<CompanyModel> {
        try {
            const company =
                await this.Company.findByPk(companyId);

            if (!company) {
                throw new Error("Company not found");
            }

            const {
                name,
                address,
                organizationIds,
            } = updates;

            if (organizationIds) {
                for (const organizationId of organizationIds) {
                    const organization =
                        await this.Organization.findByPk(
                            organizationId
                        );

                    if (!organization) {
                        throw new Error(
                            `Organization with ID ${organizationId} does not exist.`
                        );
                    }
                }

                await this.CompaniesOrganizations.destroy({
                    where: {
                        companyId,
                    },
                });

                for (const organizationId of organizationIds) {
                    await this.CompaniesOrganizations.create({
                        companyId,
                        organizationId,
                    });
                }
            }

            return await company.update({
                companyName: name,
                address,
            });
        } catch (error) {
            throw new Error(
                `Error while updating company caused by:${getErrorMessage(error)}`
            );
        }
    }

    async disableCompany(
        companyId: number,
        timestamp: number
    ): Promise<void> {
        try {
            await this.Company.update(
                {
                    disabledAt: timestamp,
                },
                {
                    where: {
                        id: companyId,
                        disabledAt: {
                            [Op.is]: null,
                        },
                        createdAt: {
                            [Op.lt]: timestamp,
                        },
                    },
                }
            );
        } catch (error) {
            throw new Error(
                `Error disabling company: ${getErrorMessage(error)}`
            );
        }
    }

    async deleteCompany(companyId: number): Promise<void> {
        try {
            await _deleteFromModelByParams(
                this.CompaniesOrganizations,
                {
                    companyId,
                }
            );

            await _deleteFromModelByParams(
                this.Company,
                {
                    id: companyId,
                }
            );
        } catch (error) {
            throw new Error(
                `Error deleting company: ${getErrorMessage(error)}`
            );
        }
    }
}

export default CompanyRepository;