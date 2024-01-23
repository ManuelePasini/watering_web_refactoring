class OptStateDto {

  constructor(matrixId, refStructureName, companyName, fieldName, plantRow, plantNum, timestampFrom, timestampTo, matrixDataList) {
    this.matrixId = matrixId
    this.refStructureName = refStructureName
    this.companyName = companyName
    this.fieldName = fieldName
    this.plantRow = plantRow
    this.plantNum = plantNum
    this.timestampFrom = timestampFrom
    this.timestampTo = timestampTo
    this.matrixDataList = matrixDataList
  }

}

class MatrixData {

  constructor(xx, yy, zz, optValue, weight) {
    this.xx = xx
    this.yy = yy
    this.zz = zz
    this.optValue = optValue
    this.weight = weight
  }

}

module.exports = {OptStateDto, MatrixData}