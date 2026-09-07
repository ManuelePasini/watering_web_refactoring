import { QueryTypes, Sequelize } from "sequelize";


interface Log {
    timestamp: number;
    type: string;
    description: string | null;
}


class LogRepository {
    private readonly sequelize: Sequelize;

    constructor(
        _models: unknown,
        sequelize: Sequelize,
    ) {
        this.sequelize = sequelize;
    }

    async getThesisLogs(
        thesisId: number,
        timestampFrom: number,
        timestampTo: number,
    ): Promise<Log[]> {
        try {
            const query = `
                SELECT
                    timestamp,
                    type,
                    description
                FROM anomalies_logs l
                JOIN (
                    SELECT
                        'theses' AS table,
                        id
                    FROM theses
                    WHERE id = :thesisId
                        AND created_at < :timestampTo
                        AND COALESCE(disabled_at, 'infinity') > :timestampFrom

                    UNION ALL

                    SELECT DISTINCT
                        'sectors' AS table,
                        sector_id AS id
                    FROM theses_in_sectors
                    WHERE thesis_id = :thesisId
                        AND valid_from < :timestampTo
                        AND COALESCE(valid_to, 'infinity') > :timestampFrom

                    UNION ALL

                    SELECT DISTINCT
                        'devices' AS table,
                        device_id AS id
                    FROM theses_all_signals
                    WHERE thesis_id = :thesisId
                        AND valid_from < :timestampTo
                        AND COALESCE(valid_to, 'infinity') > :timestampFrom

                    UNION ALL

                    SELECT DISTINCT
                        'signals' AS table,
                        signal_id AS id
                    FROM theses_all_signals
                    WHERE thesis_id = :thesisId
                        AND valid_from < :timestampTo
                        AND COALESCE(valid_to, 'infinity') > :timestampFrom
                ) ids
                    ON l.table = ids.table
                    AND l.id_key = ids.id

                WHERE l.timestamp > :timestampFrom
                    AND l.timestamp < :timestampTo

                ORDER BY l.timestamp DESC
            `;

            return await this.sequelize.query<Log>(
                query,
                {
                    type: QueryTypes.SELECT,
                    replacements: {
                        thesisId,
                        timestampFrom,
                        timestampTo,
                    },
                },
            );
        } catch (error) {
            console.error("Error on find logs:", error);
            throw error;
        }
    }
}

export default LogRepository;