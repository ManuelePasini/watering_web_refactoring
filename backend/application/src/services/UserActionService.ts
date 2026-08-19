export const ActionTypes = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  DISABLE: 'DISABLE',
  SCHEDULE: 'SCHEDULE'
} as const

type ActionType = typeof ActionTypes[keyof typeof ActionTypes]
type LogId = number | string | null | undefined

type LogEntry = {
  userId: number
  action: ActionType
  table: string
  idKey: LogId
  timestamp: number
  description?: string | null
  payload: unknown
}

type UserActionRepository = {
  saveLogs(logEntries: LogEntry[]): Promise<unknown>
}

class UserActionService {
  private userActionRepository: UserActionRepository

  constructor(userActionRepository: UserActionRepository) {
    this.userActionRepository = userActionRepository
  }

  async _saveLog(userId: number, action: ActionType, table: string, ids: LogId | LogId[], description?: string | null, payload: unknown = null): Promise<unknown> {
    const timestamp = Date.now() / 1000
    const idKeys = Array.isArray(ids) ? ids : [ids]

    let payloadList: unknown[]
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

  async logCreation(userId: number, table: string, ids: LogId | LogId[], description?: string | null, payload: unknown = null): Promise<unknown> {
    return this._saveLog(userId, ActionTypes.CREATE, table, ids, description, payload)
  }

  async logUpdate(userId: number, table: string, ids: LogId | LogId[], description?: string | null, payload: unknown = null): Promise<unknown> {
    return this._saveLog(userId, ActionTypes.UPDATE, table, ids, description, payload)
  }

  async logDeletion(userId: number, table: string, ids: LogId | LogId[], description?: string | null, payload: unknown = null): Promise<unknown> {
    return this._saveLog(userId, ActionTypes.DELETE, table, ids, description, payload)
  }

  async logDisabling(userId: number, table: string, ids: LogId | LogId[], description?: string | null, payload: unknown = null): Promise<unknown> {
    return this._saveLog(userId, ActionTypes.DISABLE, table, ids, description, payload)
  }

  async logScheduling(userId: number, table: string, ids: LogId | LogId[], description?: string | null, payload: unknown = null): Promise<unknown> {
    return this._saveLog(userId, ActionTypes.SCHEDULE, table, ids, description, payload)
  }
}

export default UserActionService
