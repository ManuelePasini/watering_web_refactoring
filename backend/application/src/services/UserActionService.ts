import { ActionType, ActionTypes } from "../commons/constants.js"
import UserActionRepository from "../persistency/repository/UserActionRepository.js"

class UserActionService {
  private userActionRepository: UserActionRepository

  constructor(userActionRepository: UserActionRepository) {
    this.userActionRepository = userActionRepository
  }

  async _saveLog(userId: number, action: ActionType, table: string, ids: number | number[], description?: string | null, payload: unknown = null): Promise<unknown> {
    const timestamp = Date.now() / 1000
    const idKeys = Array.isArray(ids) ? ids : [ids]

    let payloadList: any[]
    if (Array.isArray(payload) && payload.length === idKeys.length) {
      payloadList = payload
    } else {
      payloadList = new Array(idKeys.length).fill(payload)
    }

    const logEntries = idKeys.map((id, index) => ({
      userId,
      action,
      table,
      idKey: id,
      timestamp,
      description,
      payload: payloadList[index]
    }))

    try {
      return await this.userActionRepository.saveLogs(logEntries)
    } catch (error) {
      throw new Error(`Error logging user action caused by: ${error.message}`)
    }
  }

  async logCreation(userId: number, table: string, ids: number | number[], description?: string | null, payload: unknown = null): Promise<unknown> {
    return this._saveLog(userId, ActionTypes.CREATE, table, ids, description, payload)
  }

  async logUpdate(userId: number, table: string, ids: number | number[], description?: string | null, payload: unknown = null): Promise<unknown> {
    return this._saveLog(userId, ActionTypes.UPDATE, table, ids, description, payload)
  }

  async logDeletion(userId: number, table: string, ids: number | number[], description?: string | null, payload: unknown = null): Promise<unknown> {
    return this._saveLog(userId, ActionTypes.DELETE, table, ids, description, payload)
  }

  async logDisabling(userId: number, table: string, ids: number | number[], description?: string | null, payload: unknown = null): Promise<unknown> {
    return this._saveLog(userId, ActionTypes.DISABLE, table, ids, description, payload)
  }

  async logScheduling(userId: number, table: string, ids: number | number[], description?: string | null, payload: unknown = null): Promise<unknown> {
    return this._saveLog(userId, ActionTypes.SCHEDULE, table, ids, description, payload)
  }
}

export default UserActionService
