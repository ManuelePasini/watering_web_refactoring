import {
    COMPANIES_PERMITS_COLUMN_MAPPING,
    isRoleAtLeast,
    Role,
} from "../commons/permissionRoles.js";
import { TABLES } from "../commons/constants.js";
import DtoConverter from "./DtoConverter.js";
import UserActionService from "./UserActionService.js";
import { Permission, UserRole } from "../dtos/userPermitsDto.js";

interface AuthorizationRepository {
    getUserFieldAvailableIds(
        userId: number,
        entity: string,
        service: string | null
    ): Promise<Permission[]>;

    getUserDeviceAvailableIds(
        userId: number,
        entity: string
    ): Promise<Permission[]>;

    getUserFieldsRoles(
        userId: number,
        entity: string | null,
        id: number | null,
        service: string | null
    ): Promise<UserRole[]>;

    getUserDeviceRoles(
        userId: number,
        entity: string,
        id: number | null
    ): Promise<UserRole[]>;

    grantUser(
        targetUserId: number,
        entityType: string,
        entityId: number,
        role: string,
        extraAttributes?: unknown
    ): Promise<{ id?: number } | null>;

    removeOldPermits(
        targetUserId: number,
        entityType: string,
        entityId: number
    ): Promise<number[] | null>;

    getResourceRelatedPermissions(
        entityType: string,
        entityId: number
    ): Promise<unknown[]>;

    getCompanyUsers(
        companyId: number
    ): Promise<unknown[]>;
}

const dtoConverter = new DtoConverter;

class AuthorizationService {
    constructor(
        private readonly authorizationRepository: AuthorizationRepository,
        private readonly userActionService: UserActionService
    ) { }

    async getAvailableEntityIds(
        userId: number,
        entity: string,
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
                    entity,
                    service
                );
        } else {
            availableIds =
                await this.authorizationRepository.getUserDeviceAvailableIds(
                    userId,
                    entity
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
        entity: string | null = null,
        id: number | null = null,
        service: string | null = null
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
                    entity,
                    id,
                    service
                );
        } else {
            userRoles =
                await this.authorizationRepository.getUserDeviceRoles(
                    userId,
                    entity,
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
        entityType: string,
        entityId: number,
        extraAttributes?: unknown
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
                entityType,
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
                    entityType,
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
        entityType: string,
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
                `Error deleting user permission: ${error instanceof Error ? error.message : error
                }`
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
                entityType,
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