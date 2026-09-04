import { Op, Sequelize } from "sequelize";

import { _deleteFromModelByParams } from "../../commons/repositoryUtils.js";
import { getErrorMessage, removeUndefined } from "../../commons/utils.js";
import { SectorServicesModel } from "../model/SectorServicesModel.js";
import { ServiceModel } from "../model/ServiceModel.js";

class SectorServiceRepository {
    private readonly SectorServices: typeof SectorServicesModel;
    private readonly Service: typeof ServiceModel;
    private readonly sequelize: Sequelize;

    constructor(
        models: {
            SectorServices: typeof SectorServicesModel;
            Service: typeof ServiceModel;
        },
        sequelize: Sequelize,
    ) {
        this.SectorServices = models.SectorServices;
        this.Service = models.Service;
        this.sequelize = sequelize;
    }

    async getServices(): Promise<InstanceType<typeof ServiceModel>[]> {
        try {
            return await this.Service.findAll();
        } catch (error) {
            throw new Error(
                `Error retrieving sector services caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async getSectorServices(
        sectorId: number,
        timeFilterFrom: number,
        timeFilterTo: number,
    ): Promise<SectorServicesModel[]> {
        try {
            return await this.SectorServices.findAll({
                where: {
                    sectorId,
                    validFrom: {
                        [Op.lte]: timeFilterTo,
                    },
                    validTo: {
                        [Op.or]: [
                            { [Op.is]: null },
                            { [Op.gt]: timeFilterFrom },
                        ],
                    },
                },
                include: [
                    {
                        model: this.Service,
                        as: "service",
                    },
                ],
            });
        } catch (error) {
            throw new Error(
                `Error retrieving sector services caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async enableSectorService(
        sectorId: number,
        serviceId: number,
        validFrom: number,
        validTo: number | null,
    ): Promise<number> {
        const model = await this.SectorServices.create({
            sectorId,
            serviceId,
            validFrom,
            validTo,
        });

        return model.id;
    }

    async disableSectorService(
        sectorId: number,
        serviceId: number,
        validTo: number,
    ): Promise<number[] | undefined> {
        try {
            const [, updatedRecords] = await this.SectorServices.update(
                {
                    validTo,
                },
                {
                    where: {
                        sectorId,
                        serviceId,
                        validFrom: {
                            [Op.lte]: validTo,
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

            return updatedRecords?.map((record) => record.id);
        } catch (error) {
            throw new Error(
                `Error disabling service in sector caused by: ${getErrorMessage(error)}`,
            );
        }
    }

    async deleteSectorServices(
        sectorId: number,
        serviceId?: number,
        timestamp?: number,
    ) {
        try {
            return await _deleteFromModelByParams(
                this.SectorServices,
                removeUndefined({
                    sectorId,
                    serviceId,
                    ...(timestamp !== undefined
                        ? {
                              validFrom: {
                                  [Op.lte]: timestamp,
                              },
                              validTo: {
                                  [Op.or]: [
                                      { [Op.is]: null },
                                      { [Op.gt]: timestamp },
                                  ],
                              },
                          }
                        : undefined),
                }),
            );
        } catch (error) {
            throw new Error(
                `Error deleting sector services: ${getErrorMessage(error)}`,
            );
        }
    }
}

export default SectorServiceRepository;