import { TABLES } from "../commons/constants.js";
import { _updateEntity } from "../commons/entityServiceUtils.js";
import { getErrorMessage } from "../commons/utils.js";
import { Company } from "../dtos/companyDto.js";
import CompanyRepository from "../persistency/repository/CompanyRepository.js";
import DeviceRepository from "../persistency/repository/DeviceRepository.js";
import FarmRepository from "../persistency/repository/FarmRepository.js";
import DeviceService from "./DeviceService.js";
import DtoConverter from "./DtoConverter.js";
import FieldService from "./FieldService.js";
import UserActionService from "./UserActionService.js";

const dtoConverter = new DtoConverter();

class CompanyService {
    constructor(
        private readonly companyRepository: CompanyRepository,
        private readonly farmRepository: FarmRepository,
        private readonly deviceRepository: DeviceRepository,
        private readonly deviceService: DeviceService,
        private readonly fieldService: FieldService,
        private readonly userActionService: UserActionService
    ) {}

    async companyExists(
        companyId: number
    ): Promise<boolean> {
        return this.companyRepository.companyExists(companyId);
    }

    async createCompany(
        userId: number,
        company: Company
    ): Promise<number> {
        try {
            const companyCreated =
                await this.companyRepository.createCompany(
                    company.name,
                    company.address,
                    company.organizationIds,
                    company.createdAt
                );

            const companyId = companyCreated.id;

            if (companyId) {
                await this.userActionService.logCreation(
                    userId,
                    TABLES.COMPANY,
                    companyId,
                    null
                );

                return companyId;
            }

            throw new Error("Company creation error");
        } catch (error) {
            console.error(
                `Error creating Company ${company.name}: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async getCompanies(
        filteringIds: number[] | null,
        timeFilterFrom: number,
        timeFilterTo: number
    ) {
        const result =
            await this.companyRepository.getCompanies(
                filteringIds,
                timeFilterFrom,
                timeFilterTo
            );

        return dtoConverter.convertCompanies(result);
    }

    async getCompanyDetails(
        companyId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
        userId: number,
        isAdmin: boolean
    ) {
        const result =
            await this.companyRepository.getCompanyDetails(
                companyId,
                timeFilterFrom,
                timeFilterTo,
                userId,
                isAdmin
            );

        return result;
    }

    async updateCompany(
        userId: number,
        company: Company
    ): Promise<void> {
        await _updateEntity(
            userId,
            company,
            this.companyRepository.updateCompany.bind(
                this.companyRepository
            ),
            this.userActionService,
            TABLES.COMPANY
        );
    }

    async disableCompany(
        userId: number,
        isAdmin: boolean,
        companyId: number,
        validTo: number
    ): Promise<void> {
        try {
            const companyDevices =
                await this.deviceRepository.getDevicesByCompany(
                    companyId
                );

            await Promise.all(
                companyDevices.map(device =>
                    this.deviceService.disableDevice(
                        userId,
                        device.id,
                        validTo
                    )
                )
            );

            const companyFarms =
                await this.farmRepository.getFarmsByCompany(
                    companyId
                );

            await Promise.all(
                companyFarms.map(farm =>
                    this.fieldService.disableFarm(
                        userId,
                        isAdmin,
                        farm.id,
                        validTo
                    )
                )
            );

            await this.companyRepository.disableCompany(
                companyId,
                validTo
            );

            await this.userActionService.logDisabling(
                userId,
                TABLES.COMPANY,
                companyId
            );
        } catch (error) {
            console.error(
                `Error disabling company: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }

    async deleteCompany(
        userId: number,
        companyId: number
    ): Promise<void> {
        try {
            const companyDevices =
                await this.deviceRepository.getDevicesByCompany(
                    companyId
                );

            await Promise.all(
                companyDevices.map(device =>
                    this.deviceService.deleteDevice(
                        userId,
                        device.id
                    )
                )
            );

            const companyFarms =
                await this.farmRepository.getFarmsByCompany(
                    companyId
                );

            await Promise.all(
                companyFarms.map(farm =>
                    this.fieldService.deleteFarm(
                        userId,
                        farm.id
                    )
                )
            );

            await this.companyRepository.deleteCompany(
                companyId
            );

            await this.userActionService.logDeletion(
                userId,
                TABLES.COMPANY,
                companyId
            );
        } catch (error) {
            console.error(
                `Error deleting company: ${getErrorMessage(error)}`
            );

            throw error;
        }
    }
}

export default CompanyService;