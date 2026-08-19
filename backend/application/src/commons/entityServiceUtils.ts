import { removeUndefined } from './utils.js'

type EntityData = {
  id: number
  [key: string]: unknown
}

type RepositoryUpdateFunction = (id: number, fields: Partial<EntityData>) => Promise<{
  get(args: { plain: true }): unknown
} | null | undefined>

type UserActionService = {
  logUpdate(userId: number, table: string, id: number, previousValue: unknown, nextValue: unknown): Promise<unknown>
}

export const _updateEntity = async (userId: number, data: EntityData, repositoryFunction: RepositoryUpdateFunction, userActionService: UserActionService, updateLogTable: string): Promise<void> => {
  try {
    const { id, ...fields } = data

    const updatedEntityInstance = await repositoryFunction(
      id,
      removeUndefined(fields)
    )

    if (updatedEntityInstance) {
      const entityData = updatedEntityInstance.get({ plain: true })
      await userActionService.logUpdate(userId, updateLogTable, id, null, entityData)
    }
  } catch (error) {
    console.error(`Error updating entity: ${error.message}`)
    throw error
  }
}
