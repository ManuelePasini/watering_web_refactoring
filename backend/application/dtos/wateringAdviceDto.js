
class WateringAdviceDto {

  constructor(timestampFrom, timestampTo, profiles) {
    this.timestampFrom = timestampFrom
    this.timestampTo = timestampTo
    this.profiles = profiles
  }

}

class WateringAdviceProfileData {

  constructor(xx, yy, zz, optValue, weight) {
    this.xx  = xx
    this.yy = yy
    this.zz = zz
    this.optValue = optValue
    this.weight = weight
  }

}

module.exports = {WateringAdviceDto,WateringAdviceProfileData}