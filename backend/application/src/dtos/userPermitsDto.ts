export class UserRole {
  role: string
  table: string
  idKeys: number[]

  constructor(role: string, table: string, idKeys: number[] = []) {
    this.role = role
    this.table = table
    this.idKeys = idKeys
  }
}

export class UserPermits {
  userId: number
  isAdmin: boolean
  roles: UserRole[]

  constructor(userId: number, isAdmin: boolean, roles: UserRole[] = []) {
    this.userId = userId
    this.isAdmin = isAdmin
    this.roles = roles
  }
}

export class UserResourcePermit {
  user: unknown
  role?: string | null
  extraAttributes?: Record<string, unknown> | null

  constructor(user: unknown, role?: string | null, extraAttributes?: Record<string, unknown> | null) {
    this.user = user
    this.role = role
    this.extraAttributes = extraAttributes
  }
}
