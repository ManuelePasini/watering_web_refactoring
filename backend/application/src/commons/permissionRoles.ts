export const ROLES = {
  ADMINISTRATOR: 'administrator',
  ACCOUNTER: 'accounter',
  PLANNER: 'planner',
  VIEWER: 'viewer'
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

const ROLE_HIERARCHY: Record<Role, Role[]> = {
  administrator: [ROLES.ACCOUNTER],
  accounter: [ROLES.PLANNER],
  planner: [ROLES.VIEWER],
  viewer: []
}

export function isRoleAtLeast(actualRole: string | null | undefined, requiredRole: Role | string): boolean {
  if (actualRole === requiredRole) return true

  const implied = ROLE_HIERARCHY[actualRole as Role] || []
  return implied.some(role => isRoleAtLeast(role, requiredRole))
}

export const COMPANIES_PERMITS_COLUMN_MAPPING = {
  COMPANY: 'company_id',
  FARM: 'farm_id',
  SECTOR: 'sector_id',
  THESIS: 'thesis_id'
} as const

export const DEVICE_PERMITS_COLUMN_MAPPING = {
  DEVICE: 'device_id',
  SIGNAL: 'signal_id'
} as const
