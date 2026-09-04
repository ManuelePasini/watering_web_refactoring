import { QueryTypes, Sequelize } from "sequelize";
import { OrganizationModel } from "../model/OrganizationModel.js";
import { OrganizationData } from "../../dtos/organizationDto.js";
import { getErrorMessage } from "../../commons/utils.js";

class OrganizationRepository {
    private readonly Organization: typeof OrganizationModel;
    private readonly sequelize: Sequelize;

    constructor(
        models: {
            Organization: typeof OrganizationModel;
        },
        sequelize: Sequelize,
    ) {
        this.Organization = models.Organization;
        this.sequelize = sequelize;
    }

    async createOrganization(
        organizationName: string,
    ): Promise<InstanceType<typeof OrganizationModel>> {
        try {
            const organizationCreated = await this.Organization.create({
                organizationName,
            });

            return organizationCreated;
        } catch (error: unknown) {
            throw new Error(
                `Error creating new organization caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async getOrganizations(): Promise<
        InstanceType<typeof OrganizationModel>[]
    > {
        try {
            const organizations = await this.Organization.findAll();

            return organizations;
        } catch (error) {
            throw new Error(
                `Error retrieving organizations caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async getOrganizationDetails(
        organizationId: number,
        userId: number,
        isAdmin: boolean,
    ): Promise<OrganizationData> {
        try {
            const query = `
                SELECT
                    o.id,
                    o.organization_name AS "name",
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', c.id,
                            'name', c.company_name
                        )
                    ) FILTER (WHERE c.id IS NOT NULL) AS companies
                FROM organizations o
                    LEFT JOIN companies_organizations co
                        ON co.organization_id = o.id
                    LEFT JOIN companies c
                        ON co.company_id = c.id
                    LEFT JOIN (
                        SELECT DISTINCT company_id
                        FROM master_data_permits
                        WHERE user_id = :userId
                    ) p
                        ON p.company_id = c.id
                WHERE o.id = :organizationId
                    AND (
                        :isAdmin = true
                        OR p.company_id = c.id
                    )
                GROUP BY o.id, o.organization_name
            `;

            const results = await this.sequelize.query<OrganizationData>(
                query,
                {
                    replacements: {
                        userId,
                        organizationId,
                        isAdmin,
                    },
                    type: QueryTypes.SELECT,
                },
            );

            return results[0];
        } catch (error) {
            throw new Error(
                `Error retrieving organization details caused by: ${getErrorMessage(error)}`,
            );
        }
    }
}

export default OrganizationRepository;