import { Op, QueryTypes, Sequelize } from "sequelize";
import { HUMIDITY_DEVICE_TYPE } from "../../commons/constants.js";
import { getErrorMessage } from "../../commons/utils.js";
import { ThesesAllSignalsModel } from "../model/ThesesAllSignalsModel.js";
import { DeviceResult } from "./DeviceRepository.js";
import { SignalResult } from "./SignalRepository.js";

export interface MeasurementByThesisResult {
    thesisName: string;
    deviceId: number;
    signalId: number;
    signalDescription: string;
    signalType: string;
    signalTypeDescription: string;
    sensorTechnology: string;
    x: number | null;
    y: number | null;
    z: number | null;
    virtual: boolean;
    unit: string;
    computed: boolean;
    timestamp: number;
    value: number | null;
}

class ThesesAllSignalsRepository {
    private readonly sequelize: Sequelize;
    private readonly ThesesAllSignals: typeof ThesesAllSignalsModel;

    constructor(
        models: {
            ThesesAllSignals: typeof ThesesAllSignalsModel;
        },
        sequelize: Sequelize,
    ) {
        this.sequelize = sequelize;
        this.ThesesAllSignals = models.ThesesAllSignals;
    }

    async getMeasurementsByThesis(
        thesisId: number,
        signalTypes: string[],
        timeFilterFrom: number,
        timeFilterTo: number,
        aggregationType?: string,
        aggregationPeriod?: number,
        offset = 0,
    ): Promise<MeasurementByThesisResult[]> {
        const col = "value * scaling_factor";

        const aggregationFunctions: Record<string, string> = {
            SUM: `SUM(${col})`,
            AVG: `AVG(${col})`,
            MIN: `MIN(${col})`,
            MAX: `MAX(${col})`,
            MED: `percentile_cont(0.5) WITHIN GROUP (ORDER BY ${col})`,
        };

        const sqlAggregation =
            aggregationFunctions[aggregationType?.toUpperCase()] ||
            aggregationFunctions.AVG;

        const results = await this.getResults(
            thesisId,
            signalTypes,
            timeFilterFrom,
            timeFilterTo,
            sqlAggregation,
            aggregationPeriod,
            offset,
        );

        return Array.isArray(results) ? results : [];
    }

    async getResults(
        thesisId: number,
        signalTypes: string[],
        timeFilterFrom: number,
        timeFilterTo: number,
        sqlAggregation: string,
        aggregationPeriod?: number,
        offset = 0,
    ): Promise<MeasurementByThesisResult[]> {
        const utcOffset = new Date().getTimezoneOffset() * -60;

        const query = `
            SELECT
                thesis_name AS "thesisName",
                device_id AS "deviceId",
                tas.signal_id AS "signalId",
                signal_description AS "signalDescription",
                signal_type AS "signalType",
                signal_type_description AS "signalTypeDescription",
                sensor_technology AS "sensorTechnology",
                x, y, z,
                virtual,
                COALESCE(scaled_unit, unit) AS "unit",
                computed,
                FLOOR((timestamp::NUMERIC + :offset + :utcOffset) / :aggregationPeriod) * :aggregationPeriod - :utcOffset AS "timestamp",
                COALESCE(
                    to_jsonb(${sqlAggregation}),
                    to_jsonb(ARRAY_AGG(raw_value) FILTER (WHERE raw_value IS NOT NULL))
                ) AS "value"
            FROM theses_all_signals tas
            LEFT JOIN measurements m
                ON m.signal_id = tas.signal_id
                AND m.timestamp BETWEEN
                    GREATEST(tas.valid_from, :timeFilterFrom)
                    AND LEAST(COALESCE(tas.valid_to, 'infinity'), :timeFilterTo)
            WHERE tas.signal_type = ANY(ARRAY[:signalTypes])
                AND tas.thesis_id = :thesisId
                AND :timeFilterFrom <= COALESCE(tas.valid_to, 'infinity')
                AND :timeFilterTo >= tas.valid_from
            GROUP BY
                thesis_name,
                device_id,
                tas.signal_id,
                signal_description,
                signal_type,
                signal_type_description,
                sensor_technology,
                x,
                y,
                z,
                virtual,
                unit,
                scaled_unit,
                computed,
                FLOOR((timestamp::NUMERIC + :offset + :utcOffset) / :aggregationPeriod) * :aggregationPeriod - :utcOffset
            ORDER BY timestamp ASC;
        `;

        const results = await this.sequelize.query<MeasurementByThesisResult>(
            query,
            {
                replacements: {
                    aggregationPeriod,
                    offset,
                    utcOffset,
                    signalTypes,
                    timeFilterFrom,
                    timeFilterTo,
                    thesisId,
                },
                type: QueryTypes.SELECT,
            },
        );

        return results;
    }

    async getGridDeviceByThesis(
        thesisId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
    ): Promise<number | null> {
        const result = await this.ThesesAllSignals.findOne({
            attributes: ["deviceId"],
            where: {
                thesisId,
                deviceType: HUMIDITY_DEVICE_TYPE,
                [Op.and]: [
                    {
                        validFrom: {
                            [Op.lte]: timeFilterTo,
                        },
                    },
                    {
                        [Op.or]: [
                            {
                                validTo: {
                                    [Op.gte]: timeFilterFrom,
                                },
                            },
                            {
                                validTo: null,
                            },
                        ],
                    },
                ],
            },
            raw: true,
        });

        return result ? result.deviceId : null;
    }

    async getAdvicesAndExpectedWaterByThesis(
        thesisId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
        aggregationPeriod: number,
        offset = 0,
    ): Promise<MeasurementByThesisResult[]> {
        const utcOffset = new Date().getTimezoneOffset() * -60;

        const query = `
            WITH valid_advices_table AS (
                SELECT td.thesis_id,
                    td.thesis_name,
                    a.watering_start,
                    a.advice
                FROM theses_denormalized td
                LEFT JOIN advices a
                    ON a.thesis_id = td.thesis_id
                    AND a.watering_start BETWEEN
                        GREATEST(td.valid_from, :timeFilterFrom)
                        AND LEAST(COALESCE(td.valid_to, 'infinity'), :timeFilterTo)
                WHERE td.thesis_id = :thesisId
            ),
            valid_expected_water_table AS (
                SELECT td.thesis_id,
                    td.thesis_name,
                    td.sector_id,
                    we.id,
                    we.watering_start,
                    we.expected_water
                FROM theses_denormalized td
                LEFT JOIN watering_events we
                    ON we.sector_id = td.sector_id
                    AND we.watering_start BETWEEN
                        GREATEST(td.valid_from, :timeFilterFrom)
                        AND LEAST(COALESCE(td.valid_to, 'infinity'), :timeFilterTo)
                WHERE td.thesis_id = :thesisId
            )

            SELECT *
            FROM (
                SELECT
                    va.thesis_name AS "thesisName",
                    'Advice for the thesis' AS "signalDescription",
                    'ADV' AS "signalType",
                    'Advice' AS "signalTypeDescription",
                    'L' AS unit,
                    FLOOR(
                        (va.watering_start::NUMERIC + :offset + :utcOffset)
                        / :aggregationPeriod
                    ) * :aggregationPeriod - :utcOffset AS timestamp,
                    COALESCE(SUM(va.advice), 0) AS value
                FROM valid_advices_table va
                GROUP BY
                    va.thesis_name,
                    FLOOR(
                        (va.watering_start::NUMERIC + :offset + :utcOffset)
                        / :aggregationPeriod
                    ) * :aggregationPeriod - :utcOffset

                UNION

                SELECT
                    vew.thesis_name AS "thesisName",
                    'Expected water' AS "signalDescription",
                    'EXP' AS "signalType",
                    'Expected Water' AS "signalTypeDescription",
                    'L' AS unit,
                    FLOOR(
                        (vew.watering_start::NUMERIC + :offset + :utcOffset)
                        / :aggregationPeriod
                    ) * :aggregationPeriod - :utcOffset AS timestamp,
                    COALESCE(SUM(vew.expected_water), 0) AS value
                FROM valid_expected_water_table vew
                GROUP BY
                    vew.thesis_name,
                    FLOOR(
                        (vew.watering_start::NUMERIC + :offset + :utcOffset)
                        / :aggregationPeriod
                    ) * :aggregationPeriod - :utcOffset
            ) AS merged_results
            ORDER BY timestamp ASC;
        `;

        const results = await this.sequelize.query<MeasurementByThesisResult>(
            query,
            {
                replacements: {
                    thesisId,
                    timeFilterFrom,
                    timeFilterTo,
                    aggregationPeriod,
                    offset,
                    utcOffset,
                },
                type: QueryTypes.SELECT,
            },
        );

        return results;
    }

    async getDevicesByThesis(
        thesisId: number,
        timestamp: number,
        deviceTypes?: string[],
        includeAnchestors = false,
    ): Promise<DeviceResult[]> {
        const query = `
            SELECT DISTINCT
                device_id AS "deviceId",
                device_type AS "deviceType",
                device_description AS "deviceDescription",
                provider_id AS "providerId",
                signal_id_on_provider AS "idOnProvider",
                signal_id AS "signalId",
                signal_description AS "signalDescription",
                sensor_technology AS "sensorTechnology",
                signal_type AS "signalType",
                signal_type_description AS "signalTypeDescription",
                measurement_timestamp AS "lastMeasurementTimestamp",
                virtual,
                unit,
                x, y, z,
                device_binning_id AS "binningId",
                association_type AS "associationType"
            FROM theses_all_signals tas
            JOIN LATERAL (
                SELECT MAX(timestamp) AS measurement_timestamp
                FROM measurements m
                WHERE m.signal_id = tas.signal_id
            ) m ON true
            WHERE thesis_id = :thesisId
                AND :timestamp BETWEEN valid_from AND COALESCE(valid_to, 'infinity')
                AND association_type IN (
                    'thesis'
                    ${includeAnchestors ? ", 'sector', 'farm'" : ""}
                )
                ${
                    deviceTypes?.length
                        ? "AND tas.device_type = ANY(ARRAY[:deviceTypes])"
                        : ""
                }
        `;

        try {
            const results = await this.sequelize.query<DeviceResult>(query, {
                replacements: {
                    thesisId,
                    timestamp,
                    deviceTypes,
                },
                type: QueryTypes.SELECT,
            });

            return results;
        } catch (error: unknown) {
            console.error(
                `Fail retrieving devices data: ${getErrorMessage(error)}`,
            );
            throw error;
        }
    }

    async getSignalsByThesis(
        thesisId: number,
        timestamp: number,
        signalTypes?: string[],
    ): Promise<SignalResult[]> {
        const query = `
            SELECT DISTINCT
                tas.device_id AS "deviceId",
                signal_id_on_provider AS "idOnProvider",
                tas.signal_id AS "signalId",
                tas.signal_description AS "signalDescription",
                tas.signal_type AS "signalType",
                tas.signal_type_description AS "signalTypeDescription",
                measurement_timestamp AS "lastMeasurementTimestamp",
                tas.x AS "x",
                tas.y AS "y",
                tas.z AS "z",
                tas.virtual AS "virtual",
                tas.unit AS "unit"
            FROM theses_all_signals tas
            JOIN LATERAL (
                SELECT MAX(timestamp) AS measurement_timestamp
                FROM measurements m
                WHERE m.signal_id = tas.signal_id
            ) m ON true
            WHERE :timestamp BETWEEN tas.valid_from AND COALESCE(tas.valid_to, 'infinity')
                ${
                    signalTypes?.length
                        ? "AND tas.signal_type = ANY(ARRAY[:signalTypes])"
                        : ""
                }
                AND tas.thesis_id = :thesisId
        `;

        const results = await this.sequelize.query<SignalResult>(query, {
            replacements: {
                thesisId,
                signalTypes,
                timestamp,
            },
            type: QueryTypes.SELECT,
        });

        return results;
    }

    async getDevicesByFarm(
        farmId: number,
        timestamp: number,
        deviceTypes?: string[],
        includeDescendants = false,
        userId?: number,
        isAdmin = false,
    ): Promise<DeviceResult[]> {
        const query = `
            SELECT DISTINCT
                device_id AS "deviceId",
                device_type AS "deviceType",
                device_description AS "deviceDescription",
                provider_id AS "providerId",
                signal_id_on_provider AS "idOnProvider",
                signal_id AS "signalId",
                signal_description AS "signalDescription",
                sensor_technology AS "sensorTechnology",
                signal_type AS "signalType",
                signal_type_description AS "signalTypeDescription",
                measurement_timestamp AS "lastMeasurementTimestamp",
                virtual,
                unit,
                x, y, z,
                device_binning_id AS "binningId",
                association_type AS "associationType"
            FROM theses_all_signals tas
            JOIN LATERAL (
                SELECT MAX(timestamp) AS measurement_timestamp
                FROM measurements m
                WHERE m.signal_id = tas.signal_id
            ) m ON true
            ${
                includeDescendants
                    ? "LEFT JOIN (SELECT DISTINCT sector_id FROM master_data_permits WHERE user_id = :userId) p ON tas.sector_id = p.sector_id"
                    : ""
            }
            WHERE farm_id = :farmId
                AND :timestamp BETWEEN valid_from AND COALESCE(valid_to, 'infinity')
                AND association_type IN (
                    'farm'
                    ${includeDescendants ? ", 'sector', 'thesis'" : ""}
                )
                ${
                    deviceTypes?.length
                        ? "AND tas.device_type = ANY(ARRAY[:deviceTypes])"
                        : ""
                }
                ${
                    includeDescendants
                        ? "AND (:isAdmin = true OR p.sector_id IS NOT NULL)"
                        : ""
                }
        `;

        try {
            const results = await this.sequelize.query<DeviceResult>(query, {
                replacements: {
                    farmId,
                    timestamp,
                    deviceTypes,
                    userId,
                    isAdmin,
                },
                type: QueryTypes.SELECT,
            });

            return results;
        } catch (error: unknown) {
            console.error(
                `Fail retrieving devices data: ${getErrorMessage(error)}`,
            );
            throw error;
        }
    }

    async getDevicesBySector(
        sectorId: number,
        timestamp: number,
        deviceTypes?: string[],
        includeAnchestors = false,
        includeDescendants = false,
    ): Promise<DeviceResult[]> {
        const query = `
            SELECT DISTINCT
                device_id AS "deviceId",
                device_type AS "deviceType",
                device_description AS "deviceDescription",
                provider_id AS "providerId",
                signal_id_on_provider AS "idOnProvider",
                signal_id AS "signalId",
                signal_description AS "signalDescription",
                sensor_technology AS "sensorTechnology",
                signal_type AS "signalType",
                signal_type_description AS "signalTypeDescription",
                measurement_timestamp AS "lastMeasurementTimestamp",
                virtual,
                unit,
                x, y, z,
                device_binning_id AS "binningId",
                association_type AS "associationType"
            FROM theses_all_signals tas
            JOIN LATERAL (
                SELECT MAX(timestamp) AS measurement_timestamp
                FROM measurements m
                WHERE m.signal_id = tas.signal_id
            ) m ON true
            WHERE sector_id = :sectorId
                AND :timestamp BETWEEN valid_from AND COALESCE(valid_to, 'infinity')
                AND association_type IN (
                    'sector'
                    ${includeDescendants ? ", 'thesis'" : ""}
                    ${includeAnchestors ? ", 'farm'" : ""}
                )
                ${
                    deviceTypes?.length
                        ? "AND tas.device_type = ANY(ARRAY[:deviceTypes])"
                        : ""
                }
        `;

        try {
            const results = await this.sequelize.query<DeviceResult>(query, {
                replacements: {
                    sectorId,
                    timestamp,
                    deviceTypes,
                },
                type: QueryTypes.SELECT,
            });

            return results;
        } catch (error: unknown) {
            console.error(
                `Fail retrieving devices data: ${getErrorMessage(error)}`,
            );
            throw error;
        }
    }
}

export default ThesesAllSignalsRepository;