
class WateringAdviceDto {

  constructor(wateringAdvice, computedAt, startWatering) {
    this.wateringAdvice = wateringAdvice
    this.computedAt = computedAt
    this.startWatering = startWatering
  }

}

class WateringAdviceDtoRequest {

  constructor(refStructureName, companyName, fieldName, sectorName, thesis) {
    this.refStructureName = refStructureName
    this.companyName = companyName
    this.fieldName = fieldName
    this.sectorName = sectorName
    this.thesis = thesis
  }

}

module.exports = {WateringAdviceDto, WateringAdviceDtoRequest}