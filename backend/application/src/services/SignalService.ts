import { TABLES } from "../commons/constants.js";
import DtoConverter from "./DtoConverter.js";
import { _updateEntity } from "../commons/entityServiceUtils.js";
import PaginationService from "./PaginationService.js";
import SignalRepository from "../persistency/repository/SignalRepository.js";
import UserActionService from "./UserActionService.js";
import { AddMeasurementsRequest, CreateSignal, SignalUpdate } from "../dtos/signalDto.js";
import { getErrorMessage } from "../commons/utils.js";

const dtoConverter = new DtoConverter();
const paginationService = new PaginationService();

class SignalService {
    constructor(
        private readonly signalRepository: SignalRepository,
        private readonly userActionService: UserActionService
    ) {}

    async createSignal(
        userId: number,
        signal: CreateSignal
    ): Promise<number | undefined> {
        try {
            const signalId =
                await this.signalRepository.createSignal(
                    signal
                );

            if (signalId) {
                await this.userActionService.logCreation(
                    userId,
                    TABLES.SIGNAL,
                    signalId,
                    null
                );

                return signalId;
            }

            return undefined;
        } catch (error) {
            console.error(
                `Error creating signal: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async updateSignal(
        userId: number,
        signalUpdateData: SignalUpdate
    ): Promise<void> {
        await _updateEntity(
            userId,
            signalUpdateData,
            this.signalRepository.updateSignal.bind(
                this.signalRepository
            ),
            this.userActionService,
            TABLES.SIGNAL
        );
    }

    async addMeasurements(
        measurementsData: AddMeasurementsRequest
    ): Promise<void> {
        try {
            const {
                id,
                measurements,
            } = measurementsData;

            const mappedMeasurements =
                measurements.map((measurement) => {
                    const dateObj = new Date(
                        measurement.timestamp * 1000
                    );

                    const value = measurement.value;

                    const validValue =
                        typeof value === "number" &&
                        !Number.isNaN(value)
                            ? value
                            : null;

                    return {
                        signalId: Number(id),
                        timestamp: Number(
                            measurement.timestamp
                        ),
                        date: dateObj
                            .toISOString()
                            .slice(0, 10),
                        time: dateObj
                            .toISOString()
                            .slice(11, 19),
                        computed: measurement.computed,
                        value: validValue,
                        rawValue:
                            validValue !== null
                                ? validValue.toString()
                                : value,
                    };
                });

            await this.signalRepository.addMeasurements(
                id,
                mappedMeasurements
            );
        } catch (error) {
            console.error(
                `Error creating measurements: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async disableSignal(
        userId: number,
        signalId: number,
        validTo: number
    ): Promise<void> {
        const disabledDeviceSignalIds =
            await this.signalRepository
                .disableSignalInDevices(
                    signalId,
                    validTo
                );

        await Promise.all(
            disabledDeviceSignalIds.map(
                (deviceSignalId) =>
                    this.userActionService.logDisabling(
                        userId,
                        TABLES.DEVICE_SIGNAL,
                        deviceSignalId
                    )
            )
        );

        await this.signalRepository.disableSignal(
            signalId,
            validTo
        );

        await this.userActionService.logDisabling(
            userId,
            TABLES.SIGNAL,
            signalId
        );
    }

    async getSignals(
        userAvailableIds: number[],
        timeFilterFrom: number,
        timeFilterTo: number,
        providerIds: number[] | undefined,
        typeIds: number[] | undefined,
        companyIds: number[] | undefined,
        deviceIds: number[] | undefined,
        page: number,
        itemsPerPage: number
    ) {
        const signalsCount =
            await this.signalRepository.countSignals(
                userAvailableIds,
                timeFilterFrom,
                timeFilterTo,
                providerIds,
                typeIds,
                companyIds,
                deviceIds
            );

        const paginationMetadata =
            paginationService.computePaginationMetadata(
                signalsCount,
                page,
                itemsPerPage
            );

        const offset =
            (paginationMetadata.page - 1) *
            paginationMetadata.pageSize;

        const limit = paginationMetadata.pageSize;

        const signals =
            await this.signalRepository.getSignals(
                userAvailableIds,
                timeFilterFrom,
                timeFilterTo,
                providerIds,
                typeIds,
                companyIds,
                deviceIds,
                offset,
                limit
            );

        return {
            data: dtoConverter.convertSignalWrapper(
                signals
            ),
            pagination: paginationMetadata,
        };
    }

    async getSignalInfo(
        signalId: number,
        timestamp: number
    ) {
        const signalInfo =
            await this.signalRepository.getSignalInfo(
                signalId,
                timestamp
            );

        if (signalInfo?.length > 0) {
            return dtoConverter.convertSignalInfoEntries(
                signalInfo
            )[0];
        }

        return undefined;
    }

    async getSignalAssociations(
        signalId: number,
        timestamp: number,
        userId: number,
        isAdmin: boolean
    ) {
        const signalAssociations =
            await this.signalRepository
                .getSignalAssociationEntries(
                    signalId,
                    timestamp,
                    userId,
                    isAdmin
                );

        if (signalAssociations?.length > 0) {
            return dtoConverter.convertAssociationsEntries(
                signalAssociations
            );
        }

        return undefined;
    }

    async getSignalTypes() {
        const signalTypes =
            await this.signalRepository.getSignalTypes();

        return dtoConverter.convertSignalTypes(
            signalTypes
        );
    }

    async signalExists(
        signalId: number
    ): Promise<boolean> {
        return this.signalRepository.signalExists(
            signalId
        );
    }

    async getProviders() {
        return this.signalRepository.getProviders();
    }
}

export default SignalService;