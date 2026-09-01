import {
    generatePassword,
    hashPassword,
    newPasswordTemplate,
} from "../commons/authUtils.js";
import { TABLES } from "../commons/constants.js";
import { sendEmail } from "../commons/gmail.service.js";
import { User } from "../dtos/userDto.js";
import { UserRole, UserPermits, Permission } from "../dtos/userPermitsDto.js";
import DtoConverter from "./DtoConverter.js";
import UserActionService from "./UserActionService.js";

const dtoConverter = new DtoConverter();

interface UserRepository {
    findUser(userId: number): Promise<User | null>;

    findUserByEmail(email: string): Promise<User | null>;

    createUser(
        email: string,
        password: string | undefined,
        name: string
    ): Promise<number | null>;

    updatePassword(
        userId: number,
        password: string
    ): Promise<void>;

    findUserPermits(userId: number): Promise<Permission[]>;

    disableUser(
        userId: number,
        validTo: Date | string
    ): Promise<void>;
}

class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly userActionService: UserActionService
    ) {}

    async findUser(userId: number) {
        const user = await this.userRepository.findUser(userId);

        if (user) {
            return dtoConverter.convertUserData(user);
        }

        return undefined;
    }

    async findUserByEmail(
        email: string,
        raw: boolean = false
    ) {
        const user = await this.userRepository.findUserByEmail(email);

        if (raw) {
            return user;
        }

        if (user) {
            return dtoConverter.convertUserData(user);
        }

        return undefined;
    }

    async createUser(
        userId: number,
        newUser: User
    ): Promise<number> {
        try {
            const newUserId =
                await this.userRepository.createUser(
                    newUser.email,
                    newUser.password,
                    newUser.name
                );

            if (!newUserId) {
                throw new Error("User creation error");
            }

            await this.userActionService.logCreation(
                userId,
                TABLES.USER,
                newUserId,
                null
            );

            if (!newUser.password) {
                await this.resetPassword(newUser.email);
            }

            return newUserId;
        } catch (error) {
            console.error(
                `Error creating user: ${
                    error instanceof Error
                        ? error.message
                        : error
                }`
            );

            throw error;
        }
    }

    async changePassword(
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<boolean> {
        const user =
            await this.userRepository.findUser(userId);

        if (!user) {
            return false;
        }

        if (user.password === currentPassword) {
            await this.userRepository.updatePassword(
                userId,
                newPassword
            );

            return true;
        }

        return false;
    }

    async resetPassword(email: string): Promise<string> {
        const user = await this.findUserByEmail(email, true);

        if (!user) {
            throw new Error("User not found");
        }

        const newPassword = generatePassword(16);

        await this.userRepository.updatePassword(
            user.id,
            hashPassword(newPassword)
        );

        try {
            await sendEmail({
                to: user.email,
                subject: "SMARTER password reset",
                html: newPasswordTemplate(
                    user.email,
                    user.name,
                    newPassword
                ),
            });
        } catch (error) {
            console.error(
                "Error sending password reset email:",
                error
            );

            throw error;
        }

        return newPassword;
    }

    async isAdmin(userId: number): Promise<boolean> {
        const permits =
            await this.userRepository.findUserPermits(userId);

        return permits
            .map(({ role }) => role)
            .includes("administrator");
    }

    async findUserPermits(
        userId: number
    ): Promise<UserPermits> {
        try {
            const user = await this.findUser(userId);

            if (!user) {
                throw new Error("User does not exist");
            }

            const results =
                await this.userRepository.findUserPermits(
                    user.id
                );

            if (!results) {
                throw new Error("Invalid result");
            }

            return await this.computeUserPermits(
                user,
                results
            );
        } catch (error) {
            console.error(
                "Error while searching for user permits:",
                error
            );

            throw error;
        }
    }

    async computeUserPermits(
        user: User,
        results: Permission[]
    ): Promise<UserPermits> {
        try {
            const map = new Map<
                string, UserRole
            >();

            let isAdmin = false;

            results.forEach((permit) => {
                if (permit.role === "administrator") {
                    isAdmin = true;
                    return;
                }

                const key = `${permit.role}||${permit.table}`;

                if (!map.has(key)) {
                    map.set(key, {
                        role: permit.role,
                        table: permit.table,
                        idKeys:
                            permit.idKey !== null
                                ? Array.from(new Set([permit.idKey]))
                                : [] as number[],
                    });
                } else if (permit.idKey !== null) {
                    map.get(key)!.idKeys.push(
                        permit.idKey
                    );
                }
            });

            const roles = Array.from(map.values()).map(
                (permit) =>
                    new UserRole(
                        permit.role,
                        permit.table,
                        Array.from(permit.idKeys)
                    )
            );

            return new UserPermits(
                user.id,
                isAdmin,
                roles
            );
        } catch (error) {
            console.error(
                "Error computing user permits:",
                error
            );

            throw error;
        }
    }

    async disableUser(
        userId: number,
        targetUserId: number,
        validTo: Date | string
    ): Promise<void> {
        try {
            await this.userRepository.disableUser(
                targetUserId,
                validTo
            );

            await this.userActionService.logDisabling(
                userId,
                TABLES.USER,
                targetUserId
            );
        } catch (error) {
            console.error(
                `Error disabling user: ${
                    error instanceof Error
                        ? error.message
                        : error
                }`
            );

            throw error;
        }
    }
}

export default UserService;