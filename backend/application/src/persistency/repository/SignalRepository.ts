import { Op, QueryTypes, Sequelize } from "sequelize";
import { getErrorMessage } from "../../commons/utils.js";
import { SignalModel } from "../model/SignalModel.js";
import { DevicesSignalsModel } from "../model/DevicesSignalsModel.js";
import { MeasurementModel } from "../model/MeasurementModel.js";
import { ProviderModel } from "../model/ProviderModel.js";
import { SignalsDenormalizedModel } from "../model/SignalsDenormalizedModel.js";
import { ThesesAllSignalsModel } from "../model/ThesesAllSignalsModel.js";
import { SignalTypeModel } from "../model/SignalTypeModel.js";
import { SignalInfo } from "../../dtos/signalDto.js";
import { DeviceAssociationResult } from "./DeviceRepository.js";

export interface SignalResult {
    providerId: number;
    idOnProvider: string | null;
    signalId: number;
    signalDescription: string | null;
    signalType: string;
    signalTypeDescription: string;
    sensorTechnology: string;
    lastMeasurementTimestamp: number | null;
    virtual: boolean;
    unit: string;
    x: number | null;
    y: number | null;
    z: number | null;
    scaledUnit?: string | null;
    scalingFactor?: number | null;
    createdAt: number;
    disabledAt: number | null;
}

export interface SignalInfoResult {
    signalId: number;
    signalDescription: string;
    signalType: string;
    signalTypeDescription: string;
    deviceId: number;
    deviceDescription: string;
    deviceType: string;
    deviceBinningId: number;
    x: number;
    y: number;
    z: number;
    virtual: boolean;
    unit: string;
    sensorTechnology: string;
    idOnProvider: string;
    providerId: number;
    validFrom: number;
    validTo: number;
    lastMeasurementTimestamp: number | null;
    createdAt: number;
    disabledAt: number | null;
}

class SignalRepository {
    private readonly Signal: typeof SignalModel;
    private readonly DevicesSignals: typeof DevicesSignalsModel;
    private readonly Measurement: typeof MeasurementModel;
    private readonly Provider: typeof ProviderModel;
    private readonly SignalsDenormalized: typeof SignalsDenormalizedModel;
    private readonly ThesesAllSignals: typeof ThesesAllSignalsModel;
    private readonly SignalType: typeof SignalTypeModel;
    private readonly sequelize: Sequelize;

    constructor(
        models: {
            Signal: typeof SignalModel;
            DevicesSignals: typeof DevicesSignalsModel;
            Measurement: typeof MeasurementModel;
            Provider: typeof ProviderModel;
            SignalsDenormalized: typeof SignalsDenormalizedModel;
            ThesesAllSignals: typeof ThesesAllSignalsModel;
            SignalType: typeof SignalTypeModel;
        },
        sequelize: Sequelize,
    ) {
        this.Signal = models.Signal;
        this.DevicesSignals = models.DevicesSignals;
        this.Measurement = models.Measurement;
        this.Provider = models.Provider;
        this.SignalsDenormalized = models.SignalsDenormalized;
        this.ThesesAllSignals = models.ThesesAllSignals;
        this.SignalType = models.SignalType;
        this.sequelize = sequelize;

        this.ThesesAllSignals.removeAttribute("id");
        this.SignalsDenormalized.removeAttribute("id");
    }

    async createSignal(signalData: any): Promise<number> {
        try {
            const createdSignal = await this.Signal.create({
                ...signalData,
            });

            return createdSignal.id;
        } catch (error) {
            throw new Error(
                `Error creating signals caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async disableSignal(
        signalId: number,
        validTo: number,
    ): Promise<void> {
        try {
            await this.Signal.update(
                {
                    disabledAt: validTo,
                },
                {
                    where: {
                        id: signalId,
                        disabledAt: {
                            [Op.is]: null,
                        },
                    },
                },
            );
        } catch (error) {
            throw new Error(
                `Error disabling signal caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async disableSignalInDevices(
        signalId: number,
        validTo: number,
    ): Promise<number[]> {
        try {
            const [updatedCount, updatedRecords] =
                await this.DevicesSignals.update(
                    {
                        validTo,
                    },
                    {
                        where: {
                            signalId,
                            validFrom: {
                                [Op.lt]: validTo,
                            },
                            validTo: {
                                [Op.or]: [
                                    { [Op.is]: null },
                                    { [Op.gt]: validTo },
                                ],
                            },
                        },
                        returning: true,
                    },
                );

            if (updatedCount > 0) {
                return updatedRecords.map((record) => record.id);
            }

            return [];
        } catch (error) {
            throw new Error(
                `Error while disabling signal in devices caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async updateSignal(
        signalId: number,
        updates: any,
    ): Promise<InstanceType<typeof SignalModel>> {
        try {
            const signal = await this.Signal.findByPk(signalId);

            if (!signal) {
                throw new Error("Signal not found");
            }

            return await signal.update(updates);
        } catch (error) {
            throw new Error(
                `Error while updating signal caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async addMeasurements(
        signalId: number,
        measurements: any[],
    ): Promise<void> {
        try {
            const signal = await this.Signal.findByPk(signalId);

            if (!signal) {
                throw new Error("Signal not found");
            }

            await this.Measurement.bulkCreate(measurements);
        } catch (error) {
            throw new Error(
                `Error while creating measurements: ${getErrorMessage(error)}`,
            );
        }
    }

    async countSignals(
        filteringIds: number[] | null,
        timeFilterFrom: number,
        timeFilterTo: number,
        providerIds?: number[],
        typeIds?: number[],
        companyIds?: number[],
        deviceIds?: number[],
    ): Promise<number> {
        const query = `
            SELECT COUNT(DISTINCT id) AS total
            FROM signals s
            JOIN devices_signals_denormalized ds
                ON ds.signal_id = s.id
            WHERE created_at < :timeFilterTo
                AND COALESCE(disabled_at, 'infinity') > :timeFilterFrom
                ${
                    providerIds?.length
                        ? "AND s.provider_id = ANY(ARRAY[:providerIds]::int[])"
                        : ""
                }
                ${
                    companyIds?.length
                        ? "AND device_company_id = ANY(ARRAY[:companyIds]::int[])"
                        : ""
                }
                ${
                    deviceIds?.length
                        ? "AND device_id = ANY(ARRAY[:deviceIds]::int[])"
                        : ""
                }
                ${
                    typeIds?.length
                        ? "AND type_id = ANY(ARRAY[:typeIds]::int[])"
                        : ""
                }
                AND ${
                    filteringIds === null
                        ? "TRUE"
                        : filteringIds.length === 0
                          ? "FALSE"
                          : "id = ANY(ARRAY[:filteringIds])"
                }
        `;

        try {
            const [result] = await this.sequelize.query<{ total: number }>(
                query,
                {
                    replacements: {
                        timeFilterFrom,
                        timeFilterTo,
                        providerIds,
                        typeIds,
                        companyIds,
                        deviceIds,
                        filteringIds,
                    },
                    type: QueryTypes.SELECT,
                },
            );

            return Number(result?.total ?? 0);
        } catch (error) {
            console.error(
                `Fail counting signals data: ${getErrorMessage(error)}`,
            );
            throw error;
        }
    }

    async getSignals(
        filteringIds: number[] | null,
        timeFilterFrom: number,
        timeFilterTo: number,
        providerIds: number[] | undefined,
        typeIds: number[] | undefined,
        companyIds: number[] | undefined,
        deviceIds: number[] | undefined,
        offset: number,
        limit: number,
    ): Promise<SignalResult[]> {
        const query = `
            WITH paginated_signals AS (
                SELECT DISTINCT
                    id,
                    created_at AS "createdAt",
                    disabled_at AS "disabledAt"
                FROM signals s
                JOIN devices_signals_denormalized ds
                    ON ds.signal_id = s.id
                WHERE created_at < :timeFilterTo
                    AND COALESCE(disabled_at, 'infinity') > :timeFilterFrom
                    ${
                        providerIds?.length
                            ? "AND s.provider_id = ANY(ARRAY[:providerIds]::int[])"
                            : ""
                    }
                    ${
                        companyIds?.length
                            ? "AND device_company_id = ANY(ARRAY[:companyIds]::int[])"
                            : ""
                    }
                    ${
                        deviceIds?.length
                            ? "AND device_id = ANY(ARRAY[:deviceIds]::int[])"
                            : ""
                    }
                    ${
                        typeIds?.length
                            ? "AND type_id = ANY(ARRAY[:typeIds]::int[])"
                            : ""
                    }
                    AND ${
                        filteringIds === null
                            ? "TRUE"
                            : filteringIds.length === 0
                              ? "FALSE"
                              : "id = ANY(ARRAY[:filteringIds])"
                    }
                ORDER BY id
                LIMIT :limit
                OFFSET :offset
            )
            SELECT DISTINCT
                s.provider_id AS "providerId",
                s.signal_id_on_provider AS "idOnProvider",
                s.signal_id AS "signalId",
                s.signal_description AS "signalDescription",
                s.signal_type AS "signalType",
                s.signal_type_description AS "signalTypeDescription",
                s.sensor_technology AS "sensorTechnology",
                m.measurement_timestamp AS "lastMeasurementTimestamp",
                s.virtual,
                s.unit,
                s.x,
                s.y,
                s.z,
                s.scaled_unit AS "scaledUnit",
                s.scaling_factor AS "scalingFactor",
                ps."createdAt",
                ps."disabledAt"
            FROM devices_signals_denormalized s
            JOIN paginated_signals ps
                ON ps.id = s.signal_id
            JOIN LATERAL (
                SELECT MAX(timestamp) AS measurement_timestamp
                FROM measurements m
                WHERE m.signal_id = s.signal_id
            ) m ON true
        `;

        try {
            return await this.sequelize.query<SignalResult>(query, {
                replacements: {
                    timeFilterFrom,
                    timeFilterTo,
                    providerIds,
                    typeIds,
                    companyIds,
                    offset,
                    deviceIds,
                    limit,
                    filteringIds,
                },
                type: QueryTypes.SELECT,
            });
        } catch (error) {
            console.error(
                `Fail retrieving signals data: ${getErrorMessage(error)}`,
            );
            throw error;
        }
    }

    async getSignalInfo(
        signalId: number,
        timestamp?: number,
    ): Promise< SignalInfoResult[] | null> {
        try {
            const signalInfo = await this.SignalsDenormalized.findAll({
                where: {
                    signalId,
                    validFrom: {
                        [Op.lt]: timestamp ?? Infinity,
                    },
                    [Op.or]: [
                        {
                            validTo: {
                                [Op.gt]: timestamp ?? -Infinity,
                            },
                        },
                        {
                            validTo: null,
                        },
                    ],
                },
                raw: true,
            });

            if (!signalInfo) {
                return null;
            }

            const lastMeasurementTimestamp =
                await this.Measurement.findOne<MeasurementModel>({
                    where: {
                        signalId,
                    },
                    order: [["timestamp", "DESC"]],
                    attributes: ["timestamp"],
                    raw: true,
                });

            const validity = await this.Signal.findByPk(signalId, {
                attributes: ["createdAt", "disabledAt"],
                raw: true,
            });

            return signalInfo.map((signal) => ({
                ...signal,
                lastMeasurementTimestamp:
                    lastMeasurementTimestamp?.timestamp ?? null,
                ...validity,
            }));
        } catch (error) {
            throw new Error(
                `Error while retrieving signal info caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async getSignalAssociationEntries(
        signalId: number,
        timestamp: number,
        userId: number,
        isAdmin: boolean,
    ): Promise<DeviceAssociationResult[]> {
        try {
            const query = `
                SELECT
                    thesis_id AS "thesisId",
                    thesis_name AS "thesisName",
                    tas.sector_id AS "sectorId",
                    sector_name AS "sectorName",
                    farm_id AS "farmId",
                    farm_name AS "farmName",
                    association_type AS "associationType"
                FROM theses_all_signals tas
                LEFT JOIN (
                    SELECT DISTINCT sector_id
                    FROM master_data_permits
                    WHERE user_id = :userId
                ) p
                    ON tas.sector_id = p.sector_id
                WHERE signal_id = :signalId
                    AND valid_from < :timestamp
                    AND COALESCE(valid_to, 'infinity') > :timestamp
                    AND (:isAdmin = true OR p.sector_id IS NOT NULL)
            `;

            return await this.sequelize.query<DeviceAssociationResult>(
                query,
                {
                    replacements: {
                        signalId,
                        timestamp,
                        userId,
                        isAdmin,
                    },
                    type: QueryTypes.SELECT,
                },
            );
        } catch (error) {
            throw new Error(
                `Error while finding signals associations: ${getErrorMessage(error)}`,
            );
        }
    }

    async signalExists(signalId: number): Promise<boolean> {
        const count = await this.Signal.count({
            where: {
                id: signalId,
            },
        });

        return count > 0;
    }

    async getProviders(): Promise<InstanceType<typeof ProviderModel>[]> {
        try {
            return await this.Provider.findAll();
        } catch (error) {
            throw new Error(
                `Error while retrieving providers data caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async getSignalTypes(): Promise<InstanceType<typeof SignalTypeModel>[]> {
        try {
            return await this.SignalType.findAll();
        } catch (error) {
            throw new Error(
                `Error while retrieving signals types data caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteSignal(signalId: number): Promise<void> {
        try {
            await this.DevicesSignals.destroy({
                where: {
                    signalId,
                },
            });

            await this.Measurement.destroy({
                where: {
                    signalId,
                },
            });

            await this.Signal.destroy({
                where: {
                    id: signalId,
                },
            });
        } catch (error) {
            throw new Error(
                `Error deleting signal caused by: ${getErrorMessage(error)}`,
            );
        }
    }
}

export default SignalRepository;