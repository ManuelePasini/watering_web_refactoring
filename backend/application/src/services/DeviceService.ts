import { TABLES } from "../commons/constants.js";
import { CreateDevice, DeviceAssociation, DeviceTargetType, UpdateDevice } from "../dtos/deviceDto.js";
import DtoConverter from "./DtoConverter.js";
import PaginationService from "./PaginationService.js";
import { _updateEntity } from "../commons/entityServiceUtils.js";
import DeviceRepository from "../persistency/repository/DeviceRepository.js";
import SignalRepository from "../persistency/repository/SignalRepository.js";
import InterpolatedProfileRepository from "../persistency/repository/InterpolatedProfileRepository.js";
import OptimalStateRepository from "../persistency/repository/OptimalStateRepository.js";
import UserActionService from "./UserActionService.js";
import { getErrorMessage } from "../commons/utils.js";

const dtoConverter = new DtoConverter();
const paginationService = new PaginationService();

class DeviceService {
    constructor(
        private readonly deviceRepository: DeviceRepository,
        private readonly signalRepository: SignalRepository,
        private readonly interpolatedProfileRepository: InterpolatedProfileRepository,
        private readonly optimalStateRepository: OptimalStateRepository,
        private readonly userActionService: UserActionService
    ) { }

    async createDevice(
        userId: number,
        device: CreateDevice
    ): Promise<number> {
        try {
            const createdDeviceId =
                await this.deviceRepository.createDevice({
                    type: device.type,
                    description: device.description,
                    location: device.location,
                    binningId: device.binningId,
                    companyId: device.companyId,
                    createdAt: device.createdAt,
                });

            if (!createdDeviceId) {
                throw new Error(
                    "Device creation failed"
                );
            }

            await this.userActionService.logCreation(
                userId,
                TABLES.DEVICE,
                createdDeviceId,
                null
            );

            return createdDeviceId;
        } catch (error) {
            console.error(
                `Error creating device: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async connectSignalsToDevice(
        userId: number,
        deviceId: number,
        signalIds: number[],
        validFrom: number
    ): Promise<void> {
        try {
            const deviceExists =
                await this.deviceRepository.deviceExists(
                    deviceId
                );

            if (!deviceExists) {
                throw new Error(
                    `Device with id ${deviceId} does not exist`
                );
            }

            const signalsExist = await Promise.all(
                signalIds.map((id) =>
                    this.signalRepository.signalExists(id)
                )
            );

            if (!signalsExist.every(Boolean)) {
                throw new Error(
                    "One or more signals do not exist"
                );
            }

            const signalDeviceIds =
                await this.deviceRepository
                    .connectSignalsToDevice(
                        deviceId,
                        signalIds,
                        validFrom
                    );

            if (signalDeviceIds.length > 0) {
                await this.userActionService.logCreation(
                    userId,
                    TABLES.DEVICE_SIGNAL,
                    signalDeviceIds,
                    null
                );
            }
        } catch (error) {
            console.error(
                `Error connecting signals to device: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async disconnectSignalsFromDevice(
        userId: number,
        deviceId: number,
        signalIds: number[],
        validTo: number
    ): Promise<void> {
        try {
            const deviceExists =
                await this.deviceRepository.deviceExists(
                    deviceId
                );

            if (!deviceExists) {
                throw new Error(
                    `Device with id ${deviceId} does not exist`
                );
            }

            const signalsExist = await Promise.all(
                signalIds.map((id) =>
                    this.signalRepository.signalExists(id)
                )
            );

            if (!signalsExist.every(Boolean)) {
                throw new Error(
                    "One or more signals do not exist"
                );
            }

            const signalDeviceIds =
                await this.deviceRepository
                    .disconnectSignalsFromDevice(
                        deviceId,
                        signalIds,
                        validTo
                    );

            if (signalDeviceIds.length > 0) {
                await this.userActionService.logDisabling(
                    userId,
                    TABLES.DEVICE_SIGNAL,
                    signalDeviceIds,
                    null
                );
            }
        } catch (error) {
            console.error(
                `Error disconnecting signals from device: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async deviceExists(
        deviceId: number
    ): Promise<boolean> {
        return this.deviceRepository.deviceExists(
            deviceId
        );
    }

    async linkDevice(
        userId: number,
        deviceAssociation: DeviceAssociation
    ): Promise<void> {
        try {
            if (!deviceAssociation.sourceId) {
                throw new Error("deviceId is required");
            }

            if (!deviceAssociation.targetId) {
                throw new Error("targetId is required");
            }

            if (
                !Object.values(DeviceTargetType).includes(
                    deviceAssociation.targetType
                )
            ) {
                throw new Error(
                    `Invalid targetType: ${deviceAssociation.targetType}`
                );
            }

            const validFrom =
                deviceAssociation.validFrom ??
                Date.now() / 1000;

            const linkFunctions = {
                [DeviceTargetType.FARM]:
                    (args: {
                        deviceId: number;
                        farmId: number;
                        validFrom: number;
                    }) =>
                        this.deviceRepository
                            .linkDeviceToFarm(args),

                [DeviceTargetType.SECTOR]:
                    (args: {
                        deviceId: number;
                        sectorId: number;
                        validFrom: number;
                    }) =>
                        this.deviceRepository
                            .linkDeviceToSector(args),

                [DeviceTargetType.THESIS]:
                    (args: {
                        deviceId: number;
                        thesisId: number;
                        validFrom: number;
                    }) =>
                        this.deviceRepository
                            .linkDeviceToThesis(args),
            };

            const logTables = {
                [DeviceTargetType.FARM]:
                    TABLES.FARM_DEVICE,

                [DeviceTargetType.SECTOR]:
                    TABLES.SECTOR_DEVICE,

                [DeviceTargetType.THESIS]:
                    TABLES.THESIS_DEVICE,
            };

            let linkId: number;

            switch (deviceAssociation.targetType) {
                case DeviceTargetType.FARM:
                    linkId =
                        await this.deviceRepository
                            .linkDeviceToFarm({
                                deviceId:
                                    deviceAssociation.sourceId,
                                farmId:
                                    deviceAssociation.targetId,
                                validFrom,
                            });
                    break;

                case DeviceTargetType.SECTOR:
                    linkId =
                        await this.deviceRepository
                            .linkDeviceToSector({
                                deviceId:
                                    deviceAssociation.sourceId,
                                sectorId:
                                    deviceAssociation.targetId,
                                validFrom,
                            });
                    break;

                case DeviceTargetType.THESIS:
                    linkId =
                        await this.deviceRepository
                            .linkDeviceToThesis({
                                deviceId:
                                    deviceAssociation.sourceId,
                                thesisId:
                                    deviceAssociation.targetId,
                                validFrom,
                            });
                    break;
            }

            await this.userActionService.logCreation(
                userId,
                logTables[deviceAssociation.targetType],
                linkId,
                null
            );
        } catch (error) {
            console.error(
                `Error linking device: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async unlinkDevice(
        userId: number,
        deviceAssociation: DeviceAssociation
    ): Promise<void> {
        try {
            if (!deviceAssociation.sourceId) {
                throw new Error("deviceId is required");
            }

            if (!deviceAssociation.targetId) {
                throw new Error("targetId is required");
            }

            const validTo =
                deviceAssociation.validTo ??
                Date.now() / 1000;

            const logTables = {
                [DeviceTargetType.FARM]:
                    TABLES.FARM_DEVICE,

                [DeviceTargetType.SECTOR]:
                    TABLES.SECTOR_DEVICE,

                [DeviceTargetType.THESIS]:
                    TABLES.THESIS_DEVICE,
            };

            let linkId: number | number[];

            switch (deviceAssociation.targetType) {
                case DeviceTargetType.FARM:
                    linkId =
                        await this.deviceRepository
                            .unlinkDeviceFromFarm({
                                deviceId:
                                    deviceAssociation.sourceId,
                                farmId:
                                    deviceAssociation.targetId,
                                validTo,
                            });
                    break;

                case DeviceTargetType.SECTOR:
                    linkId =
                        await this.deviceRepository
                            .unlinkDeviceFromSector({
                                deviceId:
                                    deviceAssociation.sourceId,
                                sectorId:
                                    deviceAssociation.targetId,
                                validTo,
                            });
                    break;

                case DeviceTargetType.THESIS:
                    linkId =
                        await this.deviceRepository
                            .unlinkDeviceFromThesis({
                                deviceId:
                                    deviceAssociation.sourceId,
                                thesisId:
                                    deviceAssociation.targetId,
                                validTo,
                            });
                    break;
            }

            await this.userActionService.logDisabling(
                userId,
                logTables[deviceAssociation.targetType],
                linkId,
                null
            );
        } catch (error) {
            console.error(
                `Error unlinking device: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async getDevices(
        userAvailableIds: number[] | null,
        timeFilterFrom: number,
        timeFilterTo: number,
        providerIds: number[] | undefined,
        types: string[] | undefined,
        companyIds: number[] | undefined,
        page: number,
        itemsPerPage: number
    ) {
        const devicesCount =
            await this.deviceRepository.countDevices(
                userAvailableIds,
                timeFilterFrom,
                timeFilterTo,
                providerIds,
                types,
                companyIds
            );

        const paginationMetadata =
            paginationService.computePaginationMetadata(
                devicesCount,
                page,
                itemsPerPage
            );

        const offset =
            (paginationMetadata.page - 1) *
            paginationMetadata.pageSize;

        const limit =
            paginationMetadata.pageSize;

        const devices =
            await this.deviceRepository.getDevices(
                userAvailableIds,
                timeFilterFrom,
                timeFilterTo,
                providerIds,
                types,
                companyIds,
                offset,
                limit
            );

        return {
            data: dtoConverter.convertDevicesDataWrapper(
                devices
            ),
            pagination: paginationMetadata,
        };
    }

    async getDevice(
        deviceId: number,
        timestamp?: number
    ) {
        const deviceData =
            await this.deviceRepository.getDevice(
                deviceId,
                timestamp
            );

        if (
            Array.isArray(deviceData) &&
            deviceData.length > 0
        ) {
            return dtoConverter
                .convertDevicesDataWrapper(deviceData)[0];
        }

        return undefined;
    }

    async updateDevice(
        userId: number,
        device: UpdateDevice
    ): Promise<void> {
        await _updateEntity(
            userId,
            device,
            this.deviceRepository.updateDevice.bind(
                this.deviceRepository
            ),
            this.userActionService,
            TABLES.DEVICE
        );
    }

    async getDeviceAssociations(
        deviceId: number,
        timestamp: number,
        userId: number,
        isAdmin: boolean
    ) {
        const deviceAssociations =
            await this.deviceRepository
                .getDeviceAssociationEntries(
                    deviceId,
                    timestamp,
                    userId,
                    isAdmin
                );

        if (deviceAssociations?.length > 0) {
            return dtoConverter.convertAssociationsEntries(
                deviceAssociations
            );
        }

        return undefined;
    }

    async disableDevice(
        userId: number,
        deviceId: number,
        timestamp: number
    ): Promise<void> {
        try {
            const optimalProfileAssignmentId =
                await this.optimalStateRepository
                    .setOptimalProfileAssignmentEndDate(
                        deviceId,
                        timestamp
                    );

            if (optimalProfileAssignmentId) {
                await this.userActionService.logDisabling(
                    userId,
                    TABLES.OPTIMAL_PROFILE,
                    optimalProfileAssignmentId
                );
            }

            // 1. Thesis
            const thesisDevId =
                await this.deviceRepository
                    .unlinkDeviceFromThesis({
                        deviceId,
                        validTo: timestamp,
                        thesisId: "ALL",
                    });

            if (thesisDevId) {
                await this.userActionService.logDisabling(
                    userId,
                    TABLES.THESIS_DEVICE,
                    thesisDevId
                );
            }

            // 2. Sector
            const sectorDevId =
                await this.deviceRepository
                    .unlinkDeviceFromSector({
                        deviceId,
                        validTo: timestamp,
                        sectorId: "ALL",
                    });

            if (sectorDevId) {
                await this.userActionService.logDisabling(
                    userId,
                    TABLES.SECTOR_DEVICE,
                    sectorDevId
                );
            }

            // 3. Farm
            const farmDevId =
                await this.deviceRepository
                    .unlinkDeviceFromFarm({
                        deviceId,
                        validTo: timestamp,
                        farmId: "ALL",
                    });

            if (farmDevId) {
                await this.userActionService.logDisabling(
                    userId,
                    TABLES.FARM_DEVICE,
                    farmDevId
                );
            }

            const signalDeviceIds =
                await this.deviceRepository
                    .disableDeviceSignals(
                        deviceId,
                        timestamp
                    );

            if (signalDeviceIds?.length > 0) {
                await this.userActionService.logDisabling(
                    userId,
                    TABLES.DEVICE_SIGNAL,
                    signalDeviceIds
                );
            }

            await this.deviceRepository.disableDevice(
                deviceId,
                timestamp
            );

            await this.userActionService.logDisabling(
                userId,
                TABLES.DEVICE,
                deviceId
            );
        } catch (error) {
            console.error(
                `Error disabling device: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async deleteDevice(
        userId: number,
        deviceId: number
    ): Promise<void> {
        try {
            const device = await this.getDevice(
                deviceId
            );

            console.log(device)

            const signalIds =
                device?.signals?.map(
                    (signal: { id: number }) =>
                        signal.id
                ) ?? [];

            const signalsToDelete: number[] = [];

            for (const signalId of signalIds) {
                const signalInfo =
                    await this.signalRepository
                        .getSignalInfo(
                            signalId,
                            null
                        );

                const deviceIds = new Set(
                    signalInfo.map(
                        (signal) => signal.deviceId
                    )
                );
                if (
                    deviceIds.size === 1 &&
                    deviceIds.has(deviceId)
                ) {
                    signalsToDelete.push(signalId);
                }
            }

            const signalDeviceIds =
                await this.deviceRepository
                    .deleteDeviceSignals(deviceId);

            if (signalDeviceIds.length > 0) {
                await this.userActionService.logDeletion(
                    userId,
                    TABLES.DEVICE_SIGNAL,
                    signalDeviceIds
                );
            }

            await Promise.all(
                signalsToDelete.map((id) =>
                    this.signalRepository.deleteSignal(id)
                )
            );

            if (signalsToDelete.length > 0) {
                await this.userActionService.logDeletion(
                    userId,
                    TABLES.SIGNAL,
                    signalsToDelete,
                    null
                );
            }

            const thesisDevId =
                await this.deviceRepository
                    .deleteDeviceInThesis(
                        undefined,
                        deviceId
                    );

            if (thesisDevId) {
                await this.userActionService.logDeletion(
                    userId,
                    TABLES.THESIS_DEVICE,
                    thesisDevId,
                    null
                );
            }

            const sectorDevId =
                await this.deviceRepository
                    .deleteDeviceInSector(
                        undefined,
                        deviceId
                    );

            if (sectorDevId) {
                await this.userActionService.logDeletion(
                    userId,
                    TABLES.SECTOR_DEVICE,
                    sectorDevId,
                    null
                );
            }

            const farmDevId =
                await this.deviceRepository
                    .deleteDeviceInFarm(
                        undefined,
                        deviceId
                    );

            if (farmDevId) {
                await this.userActionService.logDeletion(
                    userId,
                    TABLES.FARM_DEVICE,
                    farmDevId,
                    null
                );
            }

            await this.interpolatedProfileRepository
                .deleteInterpolatedProfiles(deviceId);

            const gridAssignmentId =
                await this.optimalStateRepository
                    .deleteGridOptimalProfileAssignments(
                        deviceId
                    );

            if (gridAssignmentId) {
                await this.userActionService.logDeletion(
                    userId,
                    TABLES.OPTIMAL_PROFILE,
                    gridAssignmentId
                );
            }

            await this.deviceRepository.deleteDevice(
                deviceId
            );

            await this.userActionService.logDeletion(
                userId,
                TABLES.DEVICE,
                deviceId
            );
        } catch (error) {
            console.error(
                `Error deleting device: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }
}

export default DeviceService;