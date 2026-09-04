import { GeoJsonGeometry } from "../commons/utils.js"

type DeviceConstructorArgs = {
  deviceId: number
  deviceType: string
  deviceDescription?: string
  signals?: unknown[]
  location?: GeoJsonGeometry
  binningId?: number
  createdAt?: number
  disabledAt?: number
}

export class Device {
  id: number
  type: string
  description?: string
  location?: GeoJsonGeometry
  binningId?: number
  createdAt?: number
  disabledAt?: number
  signals?: unknown[]

  constructor({ deviceId, deviceType, deviceDescription, signals, location, binningId, createdAt, disabledAt }: DeviceConstructorArgs) {
    this.id = deviceId
    this.type = deviceType
    this.description = deviceDescription
    this.location = location
    this.binningId = binningId
    this.createdAt = createdAt
    this.disabledAt = disabledAt
    this.signals = signals
  }
}

export class CreateDevice {
  type: string
  description?: string | null
  companyId: number
  location?: GeoJsonGeometry
  binningId?: number | null
  createdAt: number

  constructor(type: string, description: string | null | undefined, companyId: number, location: GeoJsonGeometry, binningId: number | null | undefined, createdAt: number) {
    this.type = type
    this.description = description
    this.companyId = companyId
    this.location = location
    this.binningId = binningId
    this.createdAt = createdAt
  }
}

export class UpdateDevice {
  id: number
  description?: string | null
  location?: GeoJsonGeometry
  binningId?: number | null

  constructor(deviceId: number, description: string | null | undefined, location: GeoJsonGeometry, binningId: number | null | undefined) {
    this.id = deviceId
    this.description = description
    this.location = location
    this.binningId = binningId
  }
}

export class DeviceAssociation {
  sourceId: number
  targetType: DeviceTargetType
  targetId: number
  validFrom?: number
  validTo?: number

  constructor(sourceId: number, targetType: DeviceTargetType, targetId: number, validFrom?: number, validTo?: number) {
    this.sourceId = sourceId
    this.targetType = targetType
    this.targetId = targetId
    this.validFrom = validFrom
    this.validTo = validTo
  }
}

export const DeviceTargetType = {
  FARM: 'FARM',
  SECTOR: 'SECTOR',
  THESIS: 'THESIS'
} as const

export type DeviceTargetType = typeof DeviceTargetType[keyof typeof DeviceTargetType]
