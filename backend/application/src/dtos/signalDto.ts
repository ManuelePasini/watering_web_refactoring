type SignalArgs = {
  signalId: number
  signalDescription?: string | null
  signalType?: string | null
  signalTypeDescription?: string | null
  x?: number | null
  y?: number | null
  z?: number | null
  virtual?: boolean | null
  unit?: string | null
  scaledUnit?: string | null
  scalingFactor?: number | null
  lastMeasurementTimestamp?: number | null
  providerId?: number | null
  idOnProvider?: string | null
  sensorTechnology?: string | null
  createdAt?: number | null
  disabledAt?: number | null
}

type CreateSignalArgs = {
  typeId: number
  description?: string | null
  x: number
  y: number
  z: number
  virtual?: boolean | null
  unit?: string | null
  scalingFactor?: number | null
  scaledUnit?: string | null
  providerId?: number | null
  idOnProvider?: string | null
  sensorTechnology?: string | null
  createdAt?: number | null
}

type SignalInfoArgs = SignalArgs & {
  devices?: unknown[]
}

export class Signal {
  id: number
  description?: string | null
  signalType?: string | null
  signalTypeDescription?: string | null
  x?: number | null
  y?: number | null
  z?: number | null
  virtual?: boolean | null
  unit?: string | null
  scaledUnit?: string | null
  scalingFactor?: number | null
  lastMeasurementTimestamp?: number | null
  providerId?: number | null
  idOnProvider?: string | null
  sensorTechnology?: string | null
  createdAt?: number | null
  disabledAt?: number | null

  constructor({ signalId, signalDescription, signalType, signalTypeDescription, x, y, z, virtual, unit, scaledUnit, scalingFactor, lastMeasurementTimestamp, providerId, idOnProvider, sensorTechnology, createdAt, disabledAt }: SignalArgs) {
    this.id = signalId
    this.description = signalDescription
    this.signalType = signalType
    this.signalTypeDescription = signalTypeDescription
    this.x = x
    this.y = y
    this.z = z
    this.virtual = virtual
    this.unit = unit
    this.scaledUnit = scaledUnit
    this.scalingFactor = scalingFactor
    this.lastMeasurementTimestamp = lastMeasurementTimestamp
    this.providerId = providerId
    this.idOnProvider = idOnProvider
    this.sensorTechnology = sensorTechnology
    this.createdAt = createdAt
    this.disabledAt = disabledAt
  }
}

export class SignalUpdate {
  id: number
  description?: string | null
  idOnProvider?: string | null
  sensorTechnology?: string | null
  scalingFactor?: number | null
  scaledUnit?: string | null

  constructor(id: number, description?: string | null, idOnProvider?: string | null, sensorTechnology?: string | null, scalingFactor?: number | null, scaledUnit?: string | null) {
    this.id = id
    this.description = description
    this.idOnProvider = idOnProvider
    this.sensorTechnology = sensorTechnology
    this.scalingFactor = scalingFactor
    this.scaledUnit = scaledUnit
  }
}

export class Measurement {
  timestamp: number
  computed?: boolean | null
  value: number

  constructor(timestamp: number, computed: boolean | null | undefined, value: number) {
    this.timestamp = timestamp
    this.computed = computed
    this.value = value
  }
}

export class AddMeasurementsRequest {
  id: number
  measurements: Measurement[]

  constructor(id: number, measurements: Measurement[]) {
    this.id = id
    this.measurements = measurements
  }
}

export class CreateSignal {
  typeId: number
  description?: string | null
  x: number
  y: number
  z: number
  virtual?: boolean | null
  unit?: string | null
  scalingFactor?: number | null
  scaledUnit?: string | null
  providerId?: number | null
  idOnProvider?: string | null
  sensorTechnology?: string | null
  createdAt?: number | null

  constructor({ typeId, description, x, y, z, virtual, unit, scalingFactor, scaledUnit, providerId, idOnProvider, sensorTechnology, createdAt }: CreateSignalArgs) {
    this.typeId = typeId
    this.description = description
    this.x = x
    this.y = y
    this.z = z
    this.virtual = virtual
    this.unit = unit
    this.scalingFactor = scalingFactor
    this.scaledUnit = scaledUnit
    this.providerId = providerId
    this.idOnProvider = idOnProvider
    this.sensorTechnology = sensorTechnology
    this.createdAt = createdAt
  }
}

export class SignalInfo extends Signal {
  devices?: unknown[]

  constructor({ devices, ...signal }: SignalInfoArgs) {
    super(signal)
    this.devices = devices
  }
}

export class SignalType {
  id: number
  name: string
  description?: string | null

  constructor({ id, name, description }: { id: number, name: string, description?: string | null }) {
    this.id = id
    this.name = name
    this.description = description
  }
}
