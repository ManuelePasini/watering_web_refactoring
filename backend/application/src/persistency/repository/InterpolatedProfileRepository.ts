import { QueryTypes, Sequelize } from "sequelize";
import { HUMIDITY_DEVICE_TYPE } from "../../commons/constants.js";


export interface InterpolatedProfileResult {
    thesisName: string;
    deviceId: number;
    binningId: number | null;
    timestamp: number | null;
    x: number | null;
    y: number | null;
    z: number | null;
    value: number | null;
}

export interface InterpolatedMeanResult {
    thesisName: string;
    deviceId: number;
    binningId: number | null;
    x: number | null;
    y: number | null;
    z: number | null;
    mean: number | null;
    std: number | null;
}

interface ThesisPointResult {
    x: number;
    y: number;
    z: number;
}

class InterpolatedProfileRepository {
    private readonly sequelize: Sequelize;

    constructor(
        _models: unknown,
        sequelize: Sequelize,
    ) {
        this.sequelize = sequelize;
    }

    async getInterpolatedProfiles(
        thesisId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
    ): Promise<InterpolatedProfileResult[]> {
        const query = `
            WITH validity_table AS (
                SELECT DISTINCT
                    tas.thesis_name,
                    tas.device_id,
                    tas.device_binning_id,
                    tas.valid_from,
                    tas.valid_to
                FROM theses_all_signals tas
                WHERE tas.device_type = :HUMIDITY_DEVICE_TYPE
                    AND tas.thesis_id = :thesisId
            )
            SELECT DISTINCT
                v.thesis_name AS "thesisName",
                v.device_id AS "deviceId",
                v.device_binning_id AS "binningId",
                ip.timestamp AS "timestamp",
                ic.x AS "x",
                ic.y AS "y",
                ic.z AS "z",
                ic.value AS "value"
            FROM validity_table v
            LEFT JOIN interpolated_profiles ip
                ON ip.grid_id = v.device_id
                AND ip.timestamp BETWEEN
                    GREATEST(v.valid_from, :timeFilterFrom)
                    AND LEAST(
                        COALESCE(v.valid_to, 'infinity'),
                        :timeFilterTo
                    )
            LEFT JOIN interpolated_cells ic
                ON ip.id = ic.profile_id
            ORDER BY ip.timestamp ASC;
        `;

        return await this.sequelize.query<InterpolatedProfileResult>(
            query,
            {
                replacements: {
                    timeFilterFrom,
                    timeFilterTo,
                    thesisId,
                    HUMIDITY_DEVICE_TYPE,
                },
                type: QueryTypes.SELECT,
            },
        );
    }

    async getInterpolatedMeans(
        thesisId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
    ): Promise<InterpolatedMeanResult[]> {
        const query = `
            WITH validity_table AS (
                SELECT DISTINCT
                    tas.thesis_name,
                    tas.device_id,
                    tas.device_binning_id,
                    tas.valid_from,
                    tas.valid_to
                FROM theses_all_signals tas
                WHERE tas.device_type = :HUMIDITY_DEVICE_TYPE
                    AND tas.thesis_id = :thesisId
            )
            SELECT DISTINCT
                v.thesis_name AS "thesisName",
                v.device_id AS "deviceId",
                v.device_binning_id AS "binningId",
                ic.x AS "x",
                ic.y AS "y",
                ic.z AS "z",
                AVG(ic.value)::numeric AS mean,
                STDDEV(ic.value)::numeric AS std
            FROM validity_table v
            LEFT JOIN interpolated_profiles ip
                ON ip.grid_id = v.device_id
                AND ip.timestamp BETWEEN
                    GREATEST(v.valid_from, :timeFilterFrom)
                    AND LEAST(
                        COALESCE(v.valid_to, 'infinity'),
                        :timeFilterTo
                    )
            LEFT JOIN interpolated_cells ic
                ON ip.id = ic.profile_id
            GROUP BY
                v.thesis_name,
                v.device_id,
                v.device_binning_id,
                ic.x,
                ic.y,
                ic.z
            ORDER BY
                ic.z,
                ic.y,
                ic.x;
        `;

        return await this.sequelize.query<InterpolatedMeanResult>(
            query,
            {
                replacements: {
                    timeFilterFrom,
                    timeFilterTo,
                    thesisId,
                    HUMIDITY_DEVICE_TYPE,
                },
                type: QueryTypes.SELECT,
            },
        );
    }

    async findLastInterpolationTimestamp(
        thesisId: number,
        timestampFrom: number,
        timestampTo: number,
    ): Promise<number | null> {
        const query = `
            SELECT MAX("timestamp") AS "lastTimestamp"
            FROM interpolated_profiles
            WHERE grid_id IN (
                SELECT device_id
                FROM theses_all_signals
                WHERE device_type = :HUMIDITY_DEVICE_TYPE
                    AND thesis_id = :thesisId
                    AND valid_from < :timestampTo
                    AND (
                        valid_to > :timestampFrom
                        OR valid_to IS NULL
                    )
            )
            AND timestamp BETWEEN :timestampFrom AND :timestampTo;
        `;

        const result =
            await this.sequelize.query<{lastTimestamp: number}>(
                query,
                {
                    type: QueryTypes.SELECT,
                    replacements: {
                        HUMIDITY_DEVICE_TYPE,
                        thesisId,
                        timestampFrom,
                        timestampTo,
                    },
                },
            );

        return result[0]?.lastTimestamp ?? null;
    }

    async findThesisPoints(
        gridId: number,
    ): Promise<ThesisPointResult[]> {
        const query = `
            SELECT
                ic."x",
                ic."y",
                ic."z"
            FROM interpolated_cells AS ic
            JOIN (
                SELECT id
                FROM interpolated_profiles
                WHERE grid_id = :gridId
                ORDER BY timestamp DESC
                LIMIT 1
            ) AS ip
                ON ip.id = ic.profile_id
            ORDER BY
                ic."x",
                ic."y",
                ic."z";
        `;

        return await this.sequelize.query<ThesisPointResult>(
            query,
            {
                type: QueryTypes.SELECT,
                replacements: {
                    gridId,
                },
            },
        );
    }

    async deleteInterpolatedProfiles(
        gridId: number,
    ): Promise<void> {
        const batchSize = 5000;

        while (true) {
            const query = `
                SELECT id
                FROM interpolated_profiles
                WHERE grid_id = :gridId
                ORDER BY id
                LIMIT :batchSize;
            `;

            const results =
                await this.sequelize.query<{id: number}>(
                    query,
                    {
                        type: QueryTypes.SELECT,
                        replacements: {
                            gridId,
                            batchSize,
                        },
                    },
                );

            if (results.length === 0) {
                break;
            }

            const profileIds = results.map((profile) => profile.id);
            const profileIdList = profileIds.join(", ");

            await this.sequelize.query(
                `
                    DELETE FROM interpolated_cells
                    WHERE profile_id IN (${profileIdList});
                `,
                {
                    type: QueryTypes.DELETE,
                },
            );

            await this.sequelize.query(
                `
                    DELETE FROM interpolated_profiles
                    WHERE id IN (${profileIdList});
                `,
                {
                    type: QueryTypes.DELETE,
                },
            );
        }
    }
}

export default InterpolatedProfileRepository;