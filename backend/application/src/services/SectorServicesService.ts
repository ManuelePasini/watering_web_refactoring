import { TABLES } from "../commons/constants.js";
import SectorServiceRepository from "../persistency/repository/SectorServiceRepository.js";
import DtoConverter from "./DtoConverter.js";
import UserActionService from "./UserActionService.js";

const dtoConverter = new DtoConverter();

class SectorServicesService {
    constructor(
        private readonly serviceRepository: SectorServiceRepository,
        private readonly userActionService: UserActionService
    ) {}

    async getServices() {
        const result =
            await this.serviceRepository.getServices();

        return dtoConverter.convertServices(result);
    }

    async getSectorServices(
        sectorId: number,
        timeFilterFrom: number,
        timeFilterTo: number
    ) {
        const result =
            await this.serviceRepository.getSectorServices(
                sectorId,
                timeFilterFrom,
                timeFilterTo
            );

        return dtoConverter.convertSectorServices(result);
    }

    async enableSectorService(
        userId: number,
        sectorId: number,
        serviceId: number,
        validFrom: number,
        validTo: number | null
    ): Promise<void> {
        if (
            validTo !== null &&
            validFrom >= validTo
        ) {
            throw new Error(
                "Invalid sector service validity period"
            );
        }

        await this.disableSectorService(
            userId,
            sectorId,
            serviceId,
            validFrom
        );

        const serviceAssociationId =
            await this.serviceRepository.enableSectorService(
                sectorId,
                serviceId,
                validFrom,
                validTo
            );

        await this.userActionService.logCreation(
            userId,
            TABLES.SECTOR_SERVICE,
            serviceAssociationId
        );
    }

    async disableSectorService(
        userId: number,
        sectorId: number,
        serviceId: number,
        validTo: number
    ): Promise<void> {
        const disabledServiceAssociationId =
            await this.serviceRepository.disableSectorService(
                sectorId,
                serviceId,
                validTo
            );

        if (disabledServiceAssociationId) {
            await this.userActionService.logDisabling(
                userId,
                TABLES.SECTOR_SERVICE,
                disabledServiceAssociationId
            );
        }
    }

    async deleteSectorService(
        userId: number,
        sectorId: number,
        serviceId: number,
        timestamp: number
    ): Promise<void> {
        const sectorServicesIds =
            await this.serviceRepository.deleteSectorServices(
                sectorId,
                serviceId,
                timestamp
            );

        if (sectorServicesIds) {
            await this.userActionService.logDeletion(
                userId,
                TABLES.SECTOR_SERVICE,
                sectorServicesIds
            );
        }
    }
}

export default SectorServicesService;