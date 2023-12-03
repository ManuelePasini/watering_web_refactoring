const DataInterpolatedRepository = require('../persistency/repository/DataInterpolatedRepository');
const DeltaRepository = require('../persistency/repository/DeltaRepository');
const HumidityBinsRepository = require('../persistency/repository/HumidityBinsRepository');
const ViewDataOriginalRepository = require('../persistency/repository/ViewDataOriginalRepository');
const WateringAdviceRepository = require('../persistency/repository/WateringAdviceRepository');
const DtoConverter = require('./DtoConverter');

const dtoConverter = new DtoConverter();

class FieldService {

    constructor(sequelize) {
        this.dataInterpolatedRepository = new DataInterpolatedRepository(sequelize);
        this.deltaRepository = new DeltaRepository(sequelize);
        this.humidityBinsRepository = new HumidityBinsRepository(sequelize);
        this.viewDataOriginalRepository = new ViewDataOriginalRepository(sequelize);
        this.wateringAdviceRepository = new WateringAdviceRepository(sequelize);
    }

    async getInterpolatedMeans(refStructureName, companyName, fieldName, plantNum, plantRow) {
        const result = await this.dataInterpolatedRepository.findInterpolatedMeans(refStructureName, companyName, fieldName, plantNum, plantRow);
        return dtoConverter.convertDataInterpolatedMeanWrapper(refStructureName, companyName, fieldName, plantNum, plantRow, result);
    }

    async getDataInterpolated(refStructureName, companyName, fieldName, plantNum, plantRow, timestamp){
        const result = await this.dataInterpolatedRepository.findDataInterpolated(refStructureName, companyName, fieldName, plantNum, plantRow, timestamp);
        return dtoConverter.convertDataInterpolatedWrapper(result);
    }

    async getDataInterpolatedRange(refStructureName, companyName, fieldName, plantNum, plantRow, timestampFrom, timestampTo) {
        const result = await this.dataInterpolatedRepository.findDataInterpolatedRange(refStructureName, companyName, fieldName, plantNum, plantRow, timestampFrom, timestampTo);
        return dtoConverter.convertDataInterpolatedWrapper(result);
    }

    async getDelta(timestampFrom, timestampTo, refStructureName, companyName, fieldName, plantNum, plantRow) {
        const result = await this.deltaRepository.findDelta(timestampFrom, timestampTo, refStructureName, companyName, fieldName, plantNum, plantRow);
        return dtoConverter.convertDeltaWrapper(result);
    }

    async getHumidityBins(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow) {
        const result = await this.humidityBinsRepository.findHumidityBins(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow);
        return dtoConverter.convertHumidityBinWrapper(result);
    }

    async getHumidityBinEvents(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow) {
        const result = await this.humidityBinsRepository.findHumidityBinEvents(detectedValueTypeId, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow);
        return dtoConverter.convertHumidityBinEventWrapper(result);
    }

    async getAverageByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType) {
        const result = await this.viewDataOriginalRepository.findAverageByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);
        return dtoConverter.convertViewDataOriginalWrapper(result);
    }

    async getEcAverageByFieldReference(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType){
        const result = await this.viewDataOriginalRepository.findEcAverageByFieldReference(timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);
        return dtoConverter.convertViewDataOriginalWrapper(result);
    }

    async getHumidityEventsByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType){
        const result = await this.viewDataOriginalRepository.findHumidityEventsByFieldReference(detectedValueTypeDescription, timeFilterFrom, timeFilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);
        return dtoConverter.convertViewDataOriginalWrapper(result);
    }

    async getWaterAdvice(timefilterFrom, timefilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType){
        const result = await this.wateringAdviceRepository.findWaterAdvice(timefilterFrom, timefilterTo, refStructureName, companyName, fieldName, plantNum, plantRow, colture, coltureType);
        return dtoConverter.convertWateringAdviceWrapper(result);
    }

}

module.exports = FieldService;