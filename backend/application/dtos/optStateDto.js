class OptStateDto {

  constructor(structureName, companyName, fieldName, sectorName, thesis, validFrom, validTo, optimalState) {
    this.structureName = structureName
    this.companyName = companyName
    this.fieldName = fieldName
    this.sectorName = sectorName
    this.thesis = thesis
    this.validFrom = validFrom
    this.validTo = validTo
    this.optimalState = optimalState
  }

}

class MatrixData {

  constructor(x, y, z, value) {
    this.x = x
    this.y = y
    this.z = z
    this.optValue = value
  }

}

module.exports = {OptStateDto, MatrixData}