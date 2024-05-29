const DataInterpolatedRepository = require('../persistency/repository/DataInterpolatedRepository');
const DeltaRepository = require('../persistency/repository/DeltaRepository');
const HumidityBinsRepository = require('../persistency/repository/HumidityBinsRepository');
const ViewDataOriginalRepository = require('../persistency/repository/ViewDataOriginalRepository');
const WateringAdviceRepository = require('../persistency/repository/WateringAdviceRepository');
const DtoConverter = require('./DtoConverter');
const FieldRepository = require('../persistency/repository/FieldRepository')

const initMatrixProfile = require('../persistency/model/MatrixProfile')
const initMatrixField = require('../persistency/model/MatrixField')
const initTranscodingField = require('../persistency/model/TranscodingField')

const { FieldCreateDto } = require('../dtos/createFieldDto')

const dtoConverter = new DtoConverter();

class FieldService {

    constructor(sequelize) {
        this.dataInterpolatedRepository = new DataInterpolatedRepository(sequelize);
        this.deltaRepository = new DeltaRepository(sequelize);
        this.humidityBinsRepository = new HumidityBinsRepository(sequelize);
        this.viewDataOriginalRepository = new ViewDataOriginalRepository(sequelize);
        this.wateringAdviceRepository = new WateringAdviceRepository(sequelize);
        this.fieldRepository = new FieldRepository(initMatrixProfile(sequelize), initMatrixField(sequelize), initTranscodingField(sequelize), sequelize);
    }

    async getInterpolatedMeans(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo) {
        const result = await this.dataInterpolatedRepository.findInterpolatedMeans(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo);
        return [dtoConverter.convertDataInterpolatedMeanWrapper(refStructureName, companyName, fieldName, sectorName, plantRow, result)];
    }

    async getDataInterpolated(refStructureName, companyName, fieldName, sectorName, plantRow, timestamp) {
        const result = await this.dataInterpolatedRepository.findDataInterpolated(refStructureName, companyName, fieldName, sectorName, plantRow, timestamp);
        return dtoConverter.convertDataInterpolatedWrapper(result);
    }

    async getDataInterpolatedRange(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo) {
        const result = await this.dataInterpolatedRepository.findDataInterpolatedRange(refStructureName, companyName, fieldName, sectorName, plantRow, timestampFrom, timestampTo);
        return dtoConverter.convertDataInterpolatedWrapper(result);
    }

    async getDelta(timestampFrom, timestampTo, refStructureName, companyName, fieldName, sectorName, plantRow) {
        const result = await this.deltaRepository.findDelta(timestampFrom, timestampTo, refStructureName, companyName, fieldName, sectorName, plantRow);
        return dtoConverter.convertDeltaWrapper(result);
    }

    async getHumidityBins(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow) {
        const result = await this.humidityBinsRepository.findHumidityBins(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow);
        return dtoConverter.convertHumidityBinWrapper(result);
    }

    async getHumidityBinEvents(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow) {
        const result = await this.humidityBinsRepository.findHumidityBinEvents(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow);
        return dtoConverter.convertHumidityBinEventWrapper(result);
    }

    async getAverageByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType) {
        const result = await this.viewDataOriginalRepository.findAverageByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);
        return dtoConverter.convertViewDataOriginalWrapper(result);
    }

    async getEcAverageByFieldReference(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType) {
        const result = await this.viewDataOriginalRepository.findEcAverageByFieldReference(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRowowow, colture, coltureType);
        return dtoConverter.convertViewDataOriginalWrapper(result);
    }

    async getHumidityEventsByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType) {
        const result = await this.viewDataOriginalRepository.findHumidityEventsByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);
        return dtoConverter.convertViewDataOriginalWrapper(result);
    }

    async getWaterAdvice(timefilterFrom, timefilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType) {
        const result = await this.wateringAdviceRepository.findWaterAdvice(timefilterFrom, timefilterTo, refStructureName, companyName, fieldName, sectorName, plantRow, colture, coltureType);
        return dtoConverter.convertWateringAdviceWrapper(result);
    }

    async createMatrixOptState(optStateDto) {
        const matrixFieldInserted = await this.fieldRepository.createMatrixField(optStateDto.structureName, optStateDto.companyName, optStateDto.fieldName, optStateDto.sectorName, optStateDto.plantRow, optStateDto.validFrom, optStateDto.validTo)
        for (const matrixData of optStateDto.optimalState) {
            await this.fieldRepository.createMatrixProfile(matrixFieldInserted.matrixId, matrixData.x, matrixData.y, matrixData.z, matrixData.value)
        }
    }

    async getCurrentWateringAdvice(refStructureName, companyName, fieldName, sectorName, plantRow) {
        return this.fieldRepository.getCurrentWaterAdvice(refStructureName, companyName, fieldName, sectorName, plantRow)
    }

    async createTranscodingFields(affiliation, request) {
        for(const structure of request.structures) {
            for (const company of structure.companies) {
                for (const field of company.fields) {
                    for (const sector of field.sectors) {
                        for (const plantRow of sector.theses) {
                            for (const sensor of plantRow.sensors) {
                                await this.fieldRepository.createTranscodingField(affiliation, structure.structureName, company.companyName, field.fieldName, field.coltureType, sector.sectorName, sector.wateringCapacity, sector.initialWatering, sector.maximumWatering, sector.adviceTime, sector.wateringType, plantRow.adviceWeight, plantRow.plantRowName, plantRow.sensorNumber, sensor.id, sensor.name, sensor.type, sensor.x, sensor.y, sensor.z)
                            }
                        }
                    }
                }
            }
        }
    }

    async findDistinctplantRowPoints(refStructureName, companyName, fieldName, sectorName, plantRow) {
        return this.dataInterpolatedRepository.findDistinctplantRowPoints(refStructureName, companyName, fieldName, sectorName, plantRow)
    }

}

module.exports = FieldService;