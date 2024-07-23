export class OptStateDto {

  constructor(refStructureName, companyName, fieldName, sectorName, plantRow, validFrom, validTo, optimalState) {
    this.refStructureName = refStructureName
    this.companyName = companyName
    this.fieldName = fieldName
    this.sectorName = sectorName
    this.plantRow = plantRow
    this.validFrom = validFrom
    this.validTo = validTo
    this.optimalState = optimalState
  }

}

export class MatrixData {

  constructor(xx, yy, zz, value, weight) {
    this.xx = xx
    this.yy = yy
    this.zz = zz
    this.optValue = value
    this.weight = weight
  }

}
