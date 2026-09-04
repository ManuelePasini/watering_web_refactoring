import { EntityRef } from "./thesisDto.js"

export class Organization {
  name: string
  id?: number | null

  constructor(organizationName: string, id?: number | null) {
    this.name = organizationName
    this.id = id
  }
}

export class OrganizationData {
  id: number
  name: string
  companies: EntityRef[]

  constructor(organizationId: number, organizationName: string, companies: EntityRef[]) {
    this.id = organizationId
    this.name = organizationName
    this.companies = companies
  }
}
