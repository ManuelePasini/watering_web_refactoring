class OptStateDto {

  constructor(structureName, companyName, fieldName, sectorName, plantRow, validFrom, validTo, optimalState) {
    this.structureName = structureName
    this.companyName = companyName
    this.fieldName = fieldName
    this.sectorName = sectorName
    this.plantRow = plantRow
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