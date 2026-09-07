type SignalDataArgs = {
  signalId: number
  deviceId?: number | null
  signalDescription?: string | null
  sensorTechnology?: string | null
  x?: number | null
  y?: number | null
  z?: number | null
  virtual?: boolean | null
  unit?: string | null
  idOnProvider?: string | null
  lastMeasurementTimestamp?: number | null
  measurements?: MeasureData[]
}

export class SignalTypeData {
  signalType: string
  signalTypeDescription?: string | null
  signals: unknown[]
  thesisName?: string | null

  constructor(signalType: string, signalTypeDescription: string | null | undefined, signals: unknown[], thesisName?: string | null) {
    this.signalType = signalType
    this.signalTypeDescription = signalTypeDescription
    this.signals = signals
    this.thesisName = thesisName
  }
}

export class SignalData {
  signalId: number
  deviceId?: number | null
  signalDescription?: string | null
  sensorTechnology?: string | null
  x?: number | null
  y?: number | null
  z?: number | null
  virtual?: boolean | null
  unit?: string | null
  idOnProvider?: string | null
  lastMeasurementTimestamp?: number | null
  measurements?: MeasureData[]

  constructor({ signalId, deviceId, signalDescription, sensorTechnology, x, y, z, virtual, unit, idOnProvider, lastMeasurementTimestamp, measurements }: SignalDataArgs) {
    this.signalId = signalId
    this.deviceId = deviceId
    this.signalDescription = signalDescription
    this.sensorTechnology = sensorTechnology
    this.x = x
    this.y = y
    this.z = z
    this.virtual = virtual
    this.unit = unit
    this.idOnProvider = idOnProvider
    this.lastMeasurementTimestamp = lastMeasurementTimestamp
    this.measurements = measurements
  }
}

export class MeasureData {
  timestamp: number
  value: number | string | null
  computed?: boolean | null

  constructor(timestamp: number, value: number | string | null, computed?: boolean | null) {
    this.timestamp = timestamp
    this.value = value
    this.computed = computed
  }
}
