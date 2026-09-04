import {
    Op,
    QueryTypes,
    Sequelize
} from "sequelize";

import { _deleteFromModelByParams } from "../../commons/repositoryUtils.js";
import { GeoJsonGeometry, getErrorMessage, removeUndefined } from "../../commons/utils.js";
import { DeviceModel } from "../model/DeviceModel.js";
import { DeviceInFarmModel } from "../model/DeviceInFarmModel.js";
import { DevicesSignalsModel } from "../model/DevicesSignalsModel.js";
import { DeviceInSectorModel } from "../model/DeviceInSectorModel.js";
import { DeviceInThesisModel } from "../model/DeviceInThesisModel.js";
import { CreateDevice, Device, UpdateDevice } from "../../dtos/deviceDto.js";
import { SignalResult } from "./SignalRepository.js";


interface DeviceAssociation {
    deviceId: number;
    validFrom: number;
    validTo?: number | null;
}

interface DeviceFarmAssociation extends DeviceAssociation {
    farmId: number;
}

interface DeviceSectorAssociation extends DeviceAssociation {
    sectorId: number;
}

interface DeviceThesisAssociation extends DeviceAssociation {
    thesisId: number;
}

interface DeviceFarmUnlinkData {
    deviceId: number;
    farmId: number | "ALL";
    validTo: number;
}

interface DeviceSectorUnlinkData {
    deviceId: number;
    sectorId: number | "ALL";
    validTo: number;
}

interface DeviceThesisUnlinkData {
    deviceId: number;
    thesisId: number | "ALL";
    validTo: number;
}

export interface DeviceResult extends SignalResult {
    deviceId: number;
    deviceType: string;
    deviceDescription: string | null;
    binningId: number | null;
    location: GeoJsonGeometry;
}

export interface DeviceAssociationResult {
    farmId: number;
    farmName: string;
    sectorId: number;
    sectorName: string;
    thesisId: number;
    thesisName: string;
    associationType: string;
}

class DeviceRepository {
    private readonly Device: typeof DeviceModel;
    private readonly DevicesSignals: typeof DevicesSignalsModel;
    private readonly DeviceInFarm: typeof DeviceInFarmModel;
    private readonly DeviceInSector: typeof DeviceInSectorModel;
    private readonly DeviceInThesis: typeof DeviceInThesisModel;
    private readonly sequelize: Sequelize;

    constructor(
        models: {
            Device: typeof DeviceModel;
            DevicesSignals: typeof DevicesSignalsModel;
            DeviceInFarm: typeof DeviceInFarmModel;
            DeviceInSector: typeof DeviceInSectorModel;
            DeviceInThesis: typeof DeviceInThesisModel;
        },
        sequelize: Sequelize,
    ) {
        this.Device = models.Device;
        this.DevicesSignals = models.DevicesSignals;
        this.DeviceInFarm = models.DeviceInFarm;
        this.DeviceInSector = models.DeviceInSector;
        this.DeviceInThesis = models.DeviceInThesis;
        this.sequelize = sequelize;
    }

    private getValidityConditions(deviceId: number, validTo: number) {
        return {
            deviceId,
            validFrom: {
                [Op.lt]: validTo,
            },
            validTo: {
                [Op.or]: [
                    { [Op.is]: null },
                    { [Op.gt]: validTo },
                ],
            },
        };
    }

    async deviceExists(deviceId: number): Promise<boolean> {
        const count = await this.Device.count({
            where: {
                id: deviceId,
            },
        });

        return count > 0;
    }

    async createDevice(deviceData: CreateDevice): Promise<number> {
        try {
            const device = await this.Device.create({
                type: deviceData.type,
                description: deviceData.description,
                location: deviceData.location,
                binningId: deviceData.binningId,
                companyId: deviceData.companyId,
                createdAt: deviceData.createdAt,
            });

            return device.id;
        } catch (error) {
            throw new Error(
                `Error creating new device caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async updateDevice(
        deviceId: number,
        updates: UpdateDevice,
    ): Promise<DeviceModel> {
        try {
            const device = await this.Device.findByPk(deviceId);

            if (!device) {
                throw new Error("Device not found");
            }

            return await device.update(updates);
        } catch (error) {
            throw new Error(
                `Error while updating device caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteDevice(deviceId: number): Promise<number[]> {
        try {
            return await _deleteFromModelByParams(
                this.Device,
                { id: deviceId },
            );
        } catch (error) {
            throw new Error(
                `Error deleting signals associations from device: ${getErrorMessage(error)}`,
            );
        }
    }

    async disableDevice(
        deviceId: number,
        validTo: number,
    ): Promise<void> {
        try {
            await this.Device.update(
                {
                    disabledAt: validTo,
                },
                {
                    where: {
                        id: deviceId,
                        disabledAt: {
                            [Op.is]: null,
                        },
                        createdAt: {
                            [Op.lt]: validTo,
                        },
                    },
                },
            );
        } catch (error) {
            throw new Error(
                `Error disabling device: ${getErrorMessage(error)}`,
            );
        }
    }

    async connectSignalsToDevice(
        deviceId: number,
        signalIds: number[],
        validFrom: number,
    ): Promise<number[]> {
        try {
            const attachedSignals = await this.DevicesSignals.bulkCreate(
                signalIds.map((signalId) => ({
                    deviceId,
                    signalId,
                    validFrom,
                })),
            );

            return attachedSignals.map((signal) => signal.id);
        } catch (error) {
            throw new Error(
                `Error connecting signals to device caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async disconnectSignalsFromDevice(
        deviceId: number,
        signalIds: number[],
        validTo: number,
    ): Promise<number[] | undefined> {
        try {
            const [, updatedRecords] = await this.DevicesSignals.update(
                {
                    validTo,
                },
                {
                    where: {
                        deviceId,
                        signalId: {
                            [Op.in]: signalIds,
                        },
                    },
                    returning: ["id"],
                },
            );

            return updatedRecords?.map((record) => record.id);
        } catch (error) {
            throw new Error(
                `Error disconnecting signals from device caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async disableDeviceSignals(
        deviceId: number,
        validTo: number,
    ): Promise<number[] | null> {
        try {
            const [, updatedRecords] = await this.DevicesSignals.update(
                {
                    validTo,
                },
                {
                    where: this.getValidityConditions(deviceId, validTo),
                    returning: true,
                },
            );

            if (updatedRecords?.length > 0) {
                return updatedRecords.map((record) => record.id);
            }

            return null;
        } catch (error) {
            throw new Error(
                `Error disabling signals from device: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteDeviceSignals(deviceId: number): Promise<number[]> {
        try {
            return await _deleteFromModelByParams(
                this.DevicesSignals,
                { deviceId },
            );
        } catch (error) {
            throw new Error(
                `Error deleting signals associations from device: ${getErrorMessage(error)}`,
            );
        }
    }

    async getDevice(
        deviceId: number,
        timestamp?: number,
    ): Promise<DeviceResult[]> {
        const query = `
            SELECT 
                ds.device_id AS "deviceId",
                ds.device_type AS "deviceType",
                ds.device_description AS "deviceDescription",
                ds.device_binning_id AS "binningId",
                d.location,
                d.created_at AS "createdAt",
                d.disabled_at AS "disabledAt",
                ds.provider_id AS "providerId",
                ds.signal_id_on_provider AS "idOnProvider",
                ds.signal_id AS "signalId",
                ds.signal_description AS "signalDescription",
                ds.sensor_technology AS "sensorTechnology",
                ds.signal_type AS "signalType",
                ds.signal_type_description AS "signalTypeDescription",
                m.measurement_timestamp AS "lastMeasurementTimestamp",
                ds.virtual,
                ds.unit,
                ds.scaled_unit AS "scaledUnit",
                ds.scaling_factor AS "scalingFactor",
                ds.x,
                ds.y,
                ds.z
            FROM devices_signals_denormalized ds
            JOIN devices d ON d.id = ds.device_id
            JOIN LATERAL (
                SELECT MAX(timestamp) AS measurement_timestamp
                FROM measurements m
                WHERE m.signal_id = ds.signal_id
            ) m ON true
            WHERE ds.device_id = :deviceId
            ${
                timestamp !== undefined
                    ? `AND valid_from < :timestamp
                       AND COALESCE(valid_to, 'infinity') > :timestamp`
                    : ""
            }
        `;

        try {
            return await this.sequelize.query<DeviceResult>(query, {
                replacements: {
                    deviceId,
                    timestamp,
                },
                type: QueryTypes.SELECT,
            });
        } catch (error) {
            console.error(
                `Fail retrieving device data: ${getErrorMessage(error)}`,
            );

            throw error;
        }
    }

    async getDevices(
        filteringIds: number[] | null,
        timeFilterFrom: number,
        timeFilterTo: number,
        providerIds?: number[],
        types?: string[],
        companyIds?: number[],
        offset = 0,
        limit = 100,
    ): Promise<DeviceResult[]> {
        const query = `
            WITH paginated_devices AS (
                SELECT DISTINCT
                    d.id,
                    d.created_at AS "createdAt",
                    d.disabled_at AS "disabledAt"
                FROM devices d
                JOIN devices_signals_denormalized ds
                    ON ds.device_id = d.id
                WHERE d.created_at < :timeFilterTo
                    AND COALESCE(d.disabled_at, 'infinity') > :timeFilterFrom

                    ${
                        providerIds?.length
                            ? "AND ds.provider_id = ANY(ARRAY[:providerIds]::int[])"
                            : ""
                    }

                    ${
                        companyIds?.length
                            ? "AND d.company_id = ANY(ARRAY[:companyIds]::int[])"
                            : ""
                    }

                    ${
                        types?.length
                            ? "AND d.type = ANY(ARRAY[:types])"
                            : ""
                    }

                    AND ${
                        filteringIds === null
                            ? "TRUE"
                            : filteringIds.length === 0
                                ? "FALSE"
                                : "d.id = ANY(ARRAY[:filteringIds])"
                    }

                ORDER BY d.id
                LIMIT :limit
                OFFSET :offset
            )

            SELECT DISTINCT
                ds.device_id AS "deviceId",
                ds.device_type AS "deviceType",
                ds.device_description AS "deviceDescription",
                ds.provider_id AS "providerId",
                ds.signal_id_on_provider AS "idOnProvider",
                ds.signal_id AS "signalId",
                ds.signal_description AS "signalDescription",
                ds.signal_type AS "signalType",
                ds.signal_type_description AS "signalTypeDescription",
                m.measurement_timestamp AS "lastMeasurementTimestamp",
                ds.virtual,
                ds.unit,
                ds.x,
                ds.y,
                ds.z,
                pd."createdAt",
                pd."disabledAt"
            FROM devices_signals_denormalized ds
            JOIN paginated_devices pd
                ON pd.id = ds.device_id
            JOIN LATERAL (
                SELECT MAX(timestamp) AS measurement_timestamp
                FROM measurements m
                WHERE m.signal_id = ds.signal_id
            ) m ON true
            WHERE valid_from < :timeFilterTo
                AND COALESCE(valid_to, 'infinity') > :timeFilterFrom
        `;

        try {
            return await this.sequelize.query<DeviceResult>(query, {
                replacements: {
                    timeFilterFrom,
                    timeFilterTo,
                    providerIds,
                    types,
                    companyIds,
                    offset,
                    limit,
                    filteringIds,
                },
                type: QueryTypes.SELECT,
            });
        } catch (error) {
            console.error(
                `Fail retrieving devices data: ${getErrorMessage(error)}`,
            );

            throw error;
        }
    }

    async countDevices(
        filteringIds: number[] | null,
        timeFilterFrom: number,
        timeFilterTo: number,
        providerIds?: number[],
        types?: string[],
        companyIds?: number[],
    ): Promise<number> {
        const query = `
            SELECT COUNT(DISTINCT d.id) AS total
            FROM devices d
            JOIN devices_signals_denormalized ds
                ON ds.device_id = d.id
            WHERE d.created_at < :timeFilterTo
                AND COALESCE(d.disabled_at, 'infinity') > :timeFilterFrom

                ${
                    providerIds?.length
                        ? "AND ds.provider_id = ANY(ARRAY[:providerIds]::int[])"
                        : ""
                }

                ${
                    companyIds?.length
                        ? "AND d.company_id = ANY(ARRAY[:companyIds]::int[])"
                        : ""
                }

                ${
                    types?.length
                        ? "AND d.type = ANY(ARRAY[:types])"
                        : ""
                }

                AND ${
                    filteringIds === null
                        ? "TRUE"
                        : filteringIds.length === 0
                            ? "FALSE"
                            : "d.id = ANY(ARRAY[:filteringIds])"
                }
        `;

        try {
            const [result] = await this.sequelize.query<{total: number}>(
                query,
                {
                    replacements: {
                        timeFilterFrom,
                        timeFilterTo,
                        providerIds,
                        types,
                        companyIds,
                        filteringIds,
                    },
                    type: QueryTypes.SELECT,
                },
            );

            return result.total;
        } catch (error) {
            console.error(
                `Fail counting devices data: ${getErrorMessage(error)}`,
            );

            throw error;
        }
    }

    async getDeviceAssociationEntries(
        deviceId: number,
        timestamp: number,
        userId: number,
        isAdmin: boolean,
    ): Promise<DeviceAssociationResult[]> {
        const query = `
            SELECT DISTINCT
                farm_id AS "farmId",
                farm_name AS "farmName",
                tas.sector_id AS "sectorId",
                sector_name AS "sectorName",
                thesis_id AS "thesisId",
                thesis_name AS "thesisName",
                association_type AS "associationType"
            FROM theses_all_signals tas

            LEFT JOIN (
                SELECT DISTINCT sector_id
                FROM master_data_permits
                WHERE user_id = :userId
            ) p ON tas.sector_id = p.sector_id

            WHERE device_id = :deviceId
                AND valid_from < :timestamp
                AND COALESCE(valid_to, 'infinity') > :timestamp
                AND (:isAdmin = true OR p.sector_id IS NOT NULL)
        `;

        try {
            return await this.sequelize.query<DeviceAssociationResult>(
                query,
                {
                    replacements: {
                        deviceId,
                        timestamp,
                        userId,
                        isAdmin,
                    },
                    type: QueryTypes.SELECT,
                },
            );
        } catch (error) {
            throw new Error(
                `Error while finding device associations: ${getErrorMessage(error)}`,
            );
        }
    }

    async linkDeviceToFarm(
        associationData: DeviceFarmAssociation,
    ): Promise<number> {
        try {
            const model = await this.DeviceInFarm.create({
                deviceId: associationData.deviceId,
                farmId: associationData.farmId,
                validFrom: associationData.validFrom,
            });

            return model.id;
        } catch (error) {
            throw new Error(
                `Error creating association between device and farm: ${getErrorMessage(error)}`,
            );
        }
    }

    async linkDeviceToSector(
        associationData: DeviceSectorAssociation,
    ): Promise<number> {
        try {
            const model = await this.DeviceInSector.create({
                deviceId: associationData.deviceId,
                sectorId: associationData.sectorId,
                validFrom: associationData.validFrom,
            });

            return model.id;
        } catch (error) {
            throw new Error(
                `Error creating association between device and sector: ${getErrorMessage(error)}`,
            );
        }
    }

    async linkDeviceToThesis(
        associationData: DeviceThesisAssociation,
    ): Promise<number> {
        try {
            const model = await this.DeviceInThesis.create({
                deviceId: associationData.deviceId,
                thesisId: associationData.thesisId,
                validFrom: associationData.validFrom,
            });

            return model.id;
        } catch (error) {
            throw new Error(
                `Error creating association between device and thesis: ${getErrorMessage(error)}`,
            );
        }
    }

    async unlinkDeviceFromFarm(
        associationData: DeviceFarmUnlinkData,
    ): Promise<number[] | undefined> {
        try {
            const [, updatedRecords] = await this.DeviceInFarm.update(
                {
                    validTo: associationData.validTo,
                },
                {
                    where: {
                        ...(associationData.farmId !== "ALL"
                            ? { farmId: associationData.farmId }
                            : {}),
                        ...this.getValidityConditions(
                            associationData.deviceId,
                            associationData.validTo,
                        ),
                    },
                    returning: ["id"],
                },
            );

            return updatedRecords?.map((record) => record.id);
        } catch (error) {
            throw new Error(
                `Error unlinking device from farm: ${getErrorMessage(error)}`,
            );
        }
    }

    async unlinkDeviceFromSector(
        associationData: DeviceSectorUnlinkData,
    ): Promise<number[] | undefined> {
        try {
            const [, updatedRecords] = await this.DeviceInSector.update(
                {
                    validTo: associationData.validTo,
                },
                {
                    where: {
                        ...(associationData.sectorId !== "ALL"
                            ? { sectorId: associationData.sectorId }
                            : {}),
                        ...this.getValidityConditions(
                            associationData.deviceId,
                            associationData.validTo,
                        ),
                    },
                    returning: ["id"],
                },
            );

            return updatedRecords?.map((record) => record.id);
        } catch (error) {
            throw new Error(
                `Error unlinking device from sector: ${getErrorMessage(error)}`,
            );
        }
    }

    async unlinkDeviceFromThesis(
        associationData: DeviceThesisUnlinkData,
    ): Promise<number[] | undefined> {
        try {
            const [, updatedRecords] = await this.DeviceInThesis.update(
                {
                    validTo: associationData.validTo,
                },
                {
                    where: {
                        ...(associationData.thesisId !== "ALL"
                            ? { thesisId: associationData.thesisId }
                            : {}),
                        ...this.getValidityConditions(
                            associationData.deviceId,
                            associationData.validTo,
                        ),
                    },
                    returning: ["id"],
                },
            );

            return updatedRecords?.map((record) => record.id);
        } catch (error) {
            throw new Error(
                `Error unlinking device from thesis: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteDeviceInFarm(
        farmId: number,
        deviceId?: number,
    ): Promise<number[]> {
        try {
            return await _deleteFromModelByParams(
                this.DeviceInFarm,
                removeUndefined({
                    farmId,
                    deviceId,
                }),
            );
        } catch (error) {
            throw new Error(
                `Error deleting device from farm: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteDeviceInSector(
        sectorId: number,
        deviceId?: number,
    ): Promise<number[]> {
        try {
            return await _deleteFromModelByParams(
                this.DeviceInSector,
                removeUndefined({
                    sectorId,
                    deviceId,
                }),
            );
        } catch (error) {
            throw new Error(
                `Error deleting device from sector: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteDeviceInThesis(
        thesisId: number,
        deviceId?: number,
    ): Promise<number[]> {
        try {
            return await _deleteFromModelByParams(
                this.DeviceInThesis,
                removeUndefined({
                    thesisId,
                    deviceId,
                }),
            );
        } catch (error) {
            throw new Error(
                `Error deleting device from thesis: ${getErrorMessage(error)}`,
            );
        }
    }

    async getThesisAssociatedDevices(
        thesisId: number,
        timestamp: number,
    ): Promise<Device[]> {
        try {
            const associations = await this.DeviceInThesis.findAll({
                where: {
                    thesisId,
                    validFrom: {
                        [Op.lte]: timestamp,
                    },
                    [Op.or]: [
                        {
                            validTo: {
                                [Op.gt]: timestamp,
                            },
                        },
                        {
                            validTo: null,
                        },
                    ],
                },
                include: [
                    {
                        model: this.Device,
                        required: true,
                        as: "device",
                    },
                ],
            });

            return associations
                .map((association) => association.device)
                .filter((device): device is DeviceModel => !!device)
                .map((device) => device.get({ plain: true }));
        } catch (error) {
            throw new Error(
                `Error while retrieving thesis devices: ${getErrorMessage(error)}`,
            );
        }
    }

    async getSectorAssociatedDevices(
        sectorId: number,
        timestamp: number,
    ): Promise<Device[]> {
        try {
            const associations = await this.DeviceInSector.findAll({
                where: {
                    sectorId,
                    validFrom: {
                        [Op.lte]: timestamp,
                    },
                    [Op.or]: [
                        {
                            validTo: {
                                [Op.gt]: timestamp,
                            },
                        },
                        {
                            validTo: null,
                        },
                    ],
                },
                include: [
                    {
                        model: this.Device,
                        required: true,
                        as: "device",
                    },
                ],
            });

            return associations
                .map((association) => association.device)
                .filter((device): device is DeviceModel => !!device)
                .map((device) => device.get({ plain: true }));
        } catch (error) {
            throw new Error(
                `Error while retrieving sectors devices: ${getErrorMessage(error)}`,
            );
        }
    }

    async getFarmAssociatedDevices(
        farmId: number,
        timestamp: number,
    ): Promise<Device[]> {
        try {
            const associations = await this.DeviceInFarm.findAll({
                where: {
                    farmId,
                    validFrom: {
                        [Op.lte]: timestamp,
                    },
                    [Op.or]: [
                        {
                            validTo: {
                                [Op.gt]: timestamp,
                            },
                        },
                        {
                            validTo: null,
                        },
                    ],
                },
                include: [
                    {
                        model: this.Device,
                        required: true,
                        as: "device",
                    },
                ],
            });

            return associations
                .map((association) => association.device)
                .filter((device): device is DeviceModel => !!device)
                .map((device) => device.get({ plain: true }));
        } catch (error) {
            throw new Error(
                `Error while retrieving farm devices: ${getErrorMessage(error)}`,
            );
        }
    }

    async getDevicesByCompany(
        companyId: number,
    ): Promise<DeviceModel[]> {
        try {
            return await this.Device.findAll({
                where: {
                    companyId,
                },
            });
        } catch (error) {
            throw new Error(
                `Error while retrieving farm devices: ${getErrorMessage(error)}`,
            );
        }
    }
}

export default DeviceRepository;