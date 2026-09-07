import { Op, Sequelize } from 'sequelize';
import { getErrorMessage } from '../../commons/utils.js';
import { UserModel } from '../model/UserModel.js';
import { PermitModel } from '../model/PermitModel.js';
import { Permission } from '../../dtos/userPermitsDto.js';


interface UserModels {
    User: typeof UserModel;
    Permit: typeof PermitModel;
}

class UserRepository {
    private readonly User: typeof UserModel;
    private readonly Permit: typeof PermitModel;
    private readonly sequelize: Sequelize;

    constructor(models: UserModels,
        sequelize: Sequelize) {
        this.User = models.User;
        this.Permit = models.Permit;
        this.sequelize = sequelize;
    }

    async findUser(userId: number): Promise<UserModel | null> {
        return await this.User.findOne({
            where: { id: userId },
        });
    }

    async findUserByEmail(email: string): Promise<UserModel | null> {
        return await this.User.findOne({
            where: { email },
        });
    }

    async findUserPermits(userId: number): Promise<Permission[]> {
        try {
            const user = await this.User.findByPk(userId, {
                include: {
                    model: this.Permit,
                    as: 'permits',
                    attributes: ['table', 'role', 'idKey'],
                },
            });

            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }

            return user.permits.map((p) => p.dataValues as Permission);
        } catch (error) {
            throw new Error(
                `Error searching for permits: ${getErrorMessage(error)}`
            );
        }
    }

    async createUser(
        email: string,
        password: string,
        name: string,
    ): Promise<number> {
        try {
            const userCreated = await this.User.create({
                email,
                password,
                name,
                createdAt: Math.floor(Date.now() / 1000),
            });

            return userCreated.id;
        } catch (error) {
            throw new Error(
                `Error saving new user caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async updatePassword(
        userId: number,
        password: string,
    ): Promise<void> {
        try {
            await this.User.update(
                { password },
                {
                    where: {
                        id: userId,
                    },
                },
            );
        } catch (error) {
            throw new Error(
                `Error saving new user caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async createPermit(
        userId: number,
        table: string,
        permitType: string,
        idKey: number | null,
    ): Promise<PermitModel> {
        try {
            const user = await this.User.findByPk(userId);

            if (!user) {
                throw new Error(
                    `User with ID ${userId} does not exist.`,
                );
            }

            const permit = await this.Permit.create({
                userId: userId,
                table,
                role: permitType,
                idKey,
            });

            return permit;
        } catch (error) {
            throw new Error(
                `Error creating new permit caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async disableUser(
        userId: number,
        timestamp: number,
    ): Promise<void> {
        try {
            await this.User.update(
                {
                    disabledAt: timestamp,
                },
                {
                    where: {
                        id: userId,
                        disabledAt: {
                            [Op.is]: null,
                        },
                        createdAt: {
                            [Op.lt]: timestamp,
                        },
                    },
                },
            );
        } catch (error) {
            throw new Error(
                `Error disabling user: ${getErrorMessage(error)}`,
            );
        }
    }
}

export default UserRepository;