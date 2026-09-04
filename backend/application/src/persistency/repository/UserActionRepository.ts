import { InferCreationAttributes, Sequelize } from 'sequelize';
import { getErrorMessage } from '../../commons/utils.js';
import { UserActionModel } from '../model/UserActionModel.js';

class UserActionRepository {
    private readonly UserAction: typeof UserActionModel;
    private readonly sequelize: Sequelize;

    constructor(
        models: {
            UserAction: typeof UserActionModel;
        },
        sequelize: Sequelize,
    ) {
        this.UserAction = models.UserAction;
        this.sequelize = sequelize;
    }

    async saveLogs(
        logEntries: Omit<InferCreationAttributes<UserActionModel>, 'id'>[],
    ): Promise<InstanceType<typeof UserActionModel>[] | undefined> {
        try {
            if (!logEntries || logEntries.length === 0) {
                return;
            }

            return await this.UserAction.bulkCreate(logEntries);
        } catch (error: unknown) {
            console.error('Error while writing logs to DB:', error);

            throw new Error(
                `Error while recording user action caused by: ${getErrorMessage(error)}`,
            );
        }
    }
}

export default UserActionRepository;