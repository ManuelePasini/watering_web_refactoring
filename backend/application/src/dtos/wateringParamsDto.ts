export class WateringParams {
  maxWatering?: number | null
  minWatering?: number | null
  wateringBaseline?: number | null
  wateringFrequency?: number | null
  ki?: number | null
  kp?: number | null
  errorFunction?: string | null
  description?: string | null

  constructor(
    maxWatering?: number | null,
    minWatering?: number | null,
    wateringBaseline?: number | null,
    wateringFrequency?: number | null,
    ki?: number | null,
    kp?: number | null,
    errorFunction?: string | null,
    description?: string | null
  ) {
    this.maxWatering = maxWatering
    this.minWatering = minWatering
    this.wateringBaseline = wateringBaseline
    this.wateringFrequency = wateringFrequency
    this.ki = ki
    this.kp = kp
    this.errorFunction = errorFunction
    this.description = description
  }
}
