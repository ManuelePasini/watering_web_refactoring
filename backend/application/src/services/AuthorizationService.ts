import {
    COMPANIES_PERMITS_COLUMN_MAPPING,
    DEVICE_PERMITS_COLUMN_MAPPING,
    isRoleAtLeast,
    Role,
} from "../commons/permissionRoles.js";
import { TableName, TABLES } from "../commons/constants.js";
import DtoConverter from "./DtoConverter.js";
import UserActionService from "./UserActionService.js";
import { Permission, UserRole } from "../dtos/userPermitsDto.js";
import AuthorizationRepository from "../persistency/repository/AuthorizationRepository.js";
import { getErrorMessage } from "../commons/utils.js";

const dtoConverter = new DtoConverter;

class AuthorizationService {
    constructor(
        private readonly authorizationRepository: AuthorizationRepository,
        private readonly userActionService: UserActionService
    ) { }

    async getAvailableEntityIds(
        userId: number,
        entity: keyof typeof COMPANIES_PERMITS_COLUMN_MAPPING | keyof typeof DEVICE_PERMITS_COLUMN_MAPPING,
        minRole: string,
        isAdmin: boolean = false,
        service: string | null = null
    ): Promise<(number | "ALL")[]> {
        if (isAdmin) {
            return ["ALL"];
        }

        let availableIds: Permission[];

        if (entity in COMPANIES_PERMITS_COLUMN_MAPPING) {
            availableIds =
                await this.authorizationRepository.getUserFieldAvailableIds(
                    userId,
                    entity as keyof typeof COMPANIES_PERMITS_COLUMN_MAPPING,
                    service
                );
        } else {
            availableIds =
                await this.authorizationRepository.getUserDeviceAvailableIds(
                    userId,
                    entity as keyof typeof DEVICE_PERMITS_COLUMN_MAPPING
                );
        }

        return [
            ...new Set(
                availableIds
                    .filter(({ role }) => isRoleAtLeast(role, minRole))
                    .map(({ idKey }) => idKey)
            ),
        ];
    }

    async isUserAuthorized(
        userId: number,
        requiredRole: Role,
        isAdmin: boolean = false,
        entity?: keyof typeof COMPANIES_PERMITS_COLUMN_MAPPING | keyof typeof DEVICE_PERMITS_COLUMN_MAPPING,
        id?: number,
        service?: string
    ): Promise<boolean> {
        if (isAdmin) {
            return true;
        }

        let userRoles: UserRole[];

        if (
            entity === null ||
            entity in COMPANIES_PERMITS_COLUMN_MAPPING
        ) {
            userRoles =
                await this.authorizationRepository.getUserFieldsRoles(
                    userId,
                    entity as keyof typeof COMPANIES_PERMITS_COLUMN_MAPPING,
                    id,
                    service
                );
        } else {
            userRoles =
                await this.authorizationRepository.getUserDeviceRoles(
                    userId,
                    entity as keyof typeof DEVICE_PERMITS_COLUMN_MAPPING,
                    id
                );
        }

        return (
            userRoles?.some(({ role }) =>
                isRoleAtLeast(role, requiredRole)
            ) ?? false
        );
    }

    async grantUser(
        userId: number,
        targetUserId: number,
        role: Role,
        entityType: keyof typeof COMPANIES_PERMITS_COLUMN_MAPPING | keyof typeof DEVICE_PERMITS_COLUMN_MAPPING,
        entityId: number,
        extraAttributes?: any
    ): Promise<void> {
        const validRequest =
            (role === "accounter" && entityType === "COMPANY") ||
            (role !== "accounter" && entityType === "SECTOR");

        const hasRequiredAuthorization =
            role === "accounter" ||
            !await this.isUserAuthorized(
                targetUserId,
                "accounter",
                false,
                entityType ,
                entityId
            );

        if (validRequest && hasRequiredAuthorization) {
            await this.deleteUserPermission(
                userId,
                targetUserId,
                entityType,
                entityId
            );

            const permit =
                await this.authorizationRepository.grantUser(
                    targetUserId,
                    entityType as TableName,
                    entityId,
                    role,
                    extraAttributes
                );

            if (permit?.id) {
                await this.userActionService.logCreation(
                    userId,
                    TABLES.PERMIT,
                    permit.id
                );
            }
            return;
        }
        throw new Error("Invalid authorization requested");
    }

    async deleteUserPermission(
        userId: number,
        targetUserId: number,
        entityType: "COMPANY" | "SECTOR",
        entityId: number
    ): Promise<void> {
        try {
            const deletedPermitIds =
                await this.authorizationRepository.removeOldPermits(
                    targetUserId,
                    entityType,
                    entityId
                );

            if (deletedPermitIds) {
                await this.userActionService.logDeletion(
                    userId,
                    TABLES.PERMIT,
                    deletedPermitIds
                );
            }
        } catch (error) {
            console.error(
                `Error deleting user permission: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async getResourceRelatedPermissions(
        entityType: string,
        entityId: number
    ) {
        const res =
            await this.authorizationRepository.getResourceRelatedPermissions(
                entityType as TableName,
                entityId
            );

        return dtoConverter.convertUsersResourcePermits(res);
    }

    async getCompanyUsers(companyId: number) {
        const res =
            await this.authorizationRepository.getCompanyUsers(companyId);

        return dtoConverter.convertUserRoles(res);
    }
}

export default AuthorizationService;