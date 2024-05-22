
class WateringAdviceDto {

  constructor(wateringAdvice, computedAt, startWatering) {
    this.wateringAdvice = wateringAdvice
    this.computedAt = computedAt
    this.startWatering = startWatering
  }

}

class WateringAdviceDtoRequest {

  constructor(refStructureName, companyName, fieldName, sectorName, plantRow) {
    this.refStructureName = refStructureName
    this.companyName = companyName
    this.fieldName = fieldName
    this.sectorName = sectorName
    this.plantRow = plantRow
  }

}

module.exports = {WateringAdviceDto, WateringAdviceDtoRequest}