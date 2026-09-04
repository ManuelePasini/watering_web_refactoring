import { Farm } from "./farmDto.js"
import { Organization } from "./organizationDto.js"

export class Company {
  id?: number | null
  name: string
  address?: string | null
  organizationIds?: number[] | null
  createdAt?: number | null
  disabledAt?: number | null

  constructor(
    companyName: string,
    address?: string | null,
    organizationIds?: number[] | null,
    companyId?: number | null,
    createdAt?: number | null,
    disabledAt?: number | null
  ) {
    this.id = companyId
    this.name = companyName
    this.address = address
    this.organizationIds = organizationIds
    this.createdAt = createdAt
    this.disabledAt = disabledAt
  }
}

export class CompanyData {
  id: number
  name: string
  address?: string | null
  organizations: Organization[]
  farms: Farm[]
  createdAt?: number | null
  disabledAt?: number | null

  constructor(companyId: number, companyName: string, address: string | null | undefined, organizations: Organization[], farms: Farm[], createdAt?: number | null, disabledAt?: number | null) {
    this.id = companyId
    this.name = companyName
    this.address = address
    this.organizations = organizations
    this.farms = farms
    this.createdAt = createdAt
    this.disabledAt = disabledAt
  }
}