import { TABLES } from '../commons/constants.js'
import DtoConverter from './DtoConverter.js'
import type UserActionService from './UserActionService.js'

const dtoConverter = new DtoConverter()

type OrganizationRepository = {
  createOrganization(organizationName: string): Promise<{ id?: number | null }>
  getOrganizations(filteringIds?: number[] | null): Promise<unknown[]>
  getOrganizationDetails(organizationId: number, userId: number, isAdmin: boolean): Promise<unknown>
}

class OrganizationService {
  private organizationRepository: OrganizationRepository
  private userActionService: UserActionService

  constructor(organizationRepository: OrganizationRepository, userActionService: UserActionService) {
    this.organizationRepository = organizationRepository
    this.userActionService = userActionService
  }

  async createOrganization(userId: number, organizationName: string): Promise<number | undefined> {
    try {
      const organizationCreated = await this.organizationRepository.createOrganization(organizationName)
      const organizationId = organizationCreated.id
      if (organizationId) {
        this.userActionService.logCreation(userId, TABLES.ORGANIZATION, organizationId, null)
        return organizationId
      }
    } catch (error) {
      console.error(`Error creating organization ${organizationName}: ${error.message}`)
      throw error
    }
  }

  async getOrganizations(filteringIds?: number[] | null): Promise<unknown> {
    const result = await this.organizationRepository.getOrganizations(filteringIds)
    return dtoConverter.convertOrganizationsDataWrapper(result)
  }

  async getOrganizationDetails(organizationId: number, userId: number, isAdmin: boolean): Promise<unknown> {
    const result = await this.organizationRepository.getOrganizationDetails(organizationId, userId, isAdmin)
    return dtoConverter.convertOrganizationDataWrapper(result)
  }
}

export default OrganizationService
