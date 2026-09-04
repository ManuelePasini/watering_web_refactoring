import { QueryTypes, Sequelize } from "sequelize";
import { HUMIDITY_DEVICE_TYPE } from "../../commons/constants.js";


export interface HumidityBinsResult {
    thesisName: string;
    deviceId: number;
    timestamp: number;
    humidityBinDescription: string;
    humidityBin: number;
    count: number;
}

export interface BinningInfoResult {
    binningId: number;
    binningDescription: string;
    humidityBin: number;
    lowerBound: number;
    upperBound: number;
    humidityBinDescription: string;
}


class HumidityBinsRepository {
    private readonly sequelize: Sequelize;

    constructor(
        _models: unknown,
        sequelize: Sequelize,
    ) {
        this.sequelize = sequelize;
    }

    async getHumidityBins(
        thesisId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
    ): Promise<HumidityBinsResult[]> {
        const query = `
            WITH validity_table AS (
                SELECT DISTINCT
                    tas.thesis_name,
                    tas.device_id,
                    tas.valid_from,
                    tas.valid_to
                FROM theses_all_signals tas
                WHERE tas.device_type = :HUMIDITY_DEVICE_TYPE
                    AND tas.thesis_id = :thesisId
            ),
            valid_interpolated_profiles_table AS (
                SELECT DISTINCT
                    v.thesis_name,
                    v.device_id,
                    ip.timestamp,
                    ic.x,
                    ic.y,
                    ic.z,
                    ic.value
                FROM validity_table v
                JOIN interpolated_profiles ip
                    ON ip.grid_id = v.device_id
                    AND ip.timestamp BETWEEN
                        GREATEST(v.valid_from, :timeFilterFrom)
                        AND LEAST(
                            COALESCE(v.valid_to, 'infinity'),
                            :timeFilterTo
                        )
                JOIN interpolated_cells ic
                    ON ip.id = ic.profile_id
            ),
            value_bins AS (
                SELECT
                    vip.thesis_name,
                    vip.device_id,
                    vip.timestamp,
                    vip.x,
                    vip.y,
                    vip.z,
                    vip.value,
                    bp.humidity_bin,
                    bp.humidity_bin_description,
                    bp.upper_bound,
                    bp.lower_bound
                FROM valid_interpolated_profiles_table vip
                JOIN devices d
                    ON d.id = vip.device_id
                CROSS JOIN LATERAL (
                    SELECT
                        ordinal AS "humidity_bin",
                        lower_bound,
                        upper_bound,
                        '[' || lower_bound
                            || ', '
                            || upper_bound
                            || ')' AS "humidity_bin_description"
                    FROM (
                        SELECT
                            b.ordinal,
                            b.bound_value AS lower_bound,
                            LEAD(b.bound_value)
                                OVER (ORDER BY b.ordinal) AS upper_bound
                        FROM profiles_bins pb
                        CROSS JOIN LATERAL (
                            VALUES
                                (pb.bound_0, 1),
                                (pb.bound_1, 2),
                                (pb.bound_2, 3),
                                (pb.bound_3, 4),
                                (pb.bound_4, 5),
                                (pb.bound_5, 6),
                                (pb.bound_6, 7)
                        ) AS b(bound_value, ordinal)
                        WHERE pb.id = d.binning_id
                            AND bound_value IS NOT NULL
                    ) sub
                    WHERE upper_bound IS NOT NULL
                ) AS bp
                GROUP BY
                    vip.thesis_name,
                    vip.device_id,
                    vip.timestamp,
                    vip.x,
                    vip.y,
                    vip.z,
                    vip.value,
                    bp.humidity_bin,
                    bp.humidity_bin_description,
                    bp.upper_bound,
                    bp.lower_bound
            ),
            calculated_results AS (
                SELECT
                    device_id,
                    timestamp,
                    humidity_bin_description,
                    humidity_bin,
                    COUNT(
                        CASE
                            WHEN value >= lower_bound
                                AND value < upper_bound
                            THEN 1
                            ELSE NULL
                        END
                    ) AS bin_count
                FROM value_bins
                GROUP BY
                    thesis_name,
                    device_id,
                    timestamp,
                    humidity_bin_description,
                    humidity_bin
            ),
            unique_devices_header AS (
                SELECT DISTINCT
                    thesis_name,
                    device_id
                FROM validity_table
            )
            SELECT
                ud.thesis_name AS "thesisName",
                ud.device_id AS "deviceId",
                res.timestamp AS "timestamp",
                res.humidity_bin_description AS "humidityBinDescription",
                res.humidity_bin AS "humidityBin",
                COALESCE(res.bin_count, 0) AS "count"
            FROM unique_devices_header ud
            LEFT JOIN calculated_results res
                ON ud.device_id = res.device_id
            ORDER BY res.timestamp ASC;
        `;

        return await this.sequelize.query<HumidityBinsResult>(
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

    async getBinningInfo(
        binningId?: number,
    ): Promise<BinningInfoResult[]> {
        const query = `
            SELECT
                id AS "binningId",
                description AS "binningDescription",
                ordinal AS "humidityBin",
                lower_bound AS "lowerBound",
                upper_bound AS "upperBound",
                '[' || lower_bound
                    || ', '
                    || upper_bound
                    || ')' AS "humidityBinDescription"
            FROM (
                SELECT
                    pb.id,
                    pb.description,
                    b.ordinal,
                    b.bound_value AS lower_bound,
                    LEAD(b.bound_value)
                        OVER (
                            PARTITION BY pb.id
                            ORDER BY b.ordinal
                        ) AS upper_bound
                FROM public.profiles_bins pb
                CROSS JOIN LATERAL (
                    VALUES
                        (pb.bound_0, 1),
                        (pb.bound_1, 2),
                        (pb.bound_2, 3),
                        (pb.bound_3, 4),
                        (pb.bound_4, 5),
                        (pb.bound_5, 6),
                        (pb.bound_6, 7)
                ) AS b(bound_value, ordinal)
                WHERE bound_value IS NOT NULL
                ${binningId !== undefined ? "AND pb.id = :binningId" : ""}
            ) sub
            WHERE upper_bound IS NOT NULL
            ORDER BY ordinal;
        `;

        return await this.sequelize.query<BinningInfoResult>(
            query,
            {
                replacements: {
                    binningId,
                },
                type: QueryTypes.SELECT,
            },
        );
    }
}

export default HumidityBinsRepository;