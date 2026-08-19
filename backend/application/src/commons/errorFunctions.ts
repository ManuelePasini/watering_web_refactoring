type NumericErrorFunction = (x: number) => number
type SqlErrorFunction = (field: string) => string

const logaritmicCapped300Error: NumericErrorFunction = (x) => {
  const xAbs = Math.abs(x)
  return xAbs < 300 ? -Math.log(xAbs) : -Math.log(300)
}

const logaritmicCapped300ErrorSQLWrapper: SqlErrorFunction = (field) => {
  return `CASE WHEN ${field} <= -300 THEN -LN(ABS(-300)) ELSE -LN(ABS(${field})) END`
}

const logaritmicCapped300ErrorUnit: SqlErrorFunction = (field) => {
  return `('-log(|' || ${field} || '|)')`
}

export const errorFunctions: Record<string, NumericErrorFunction> = {
  potential_error: logaritmicCapped300Error,
  linear_error: (x) => x
}

export const errorFunctionsSQLWrapper: Record<string, SqlErrorFunction> = {
  potential_error: logaritmicCapped300ErrorSQLWrapper,
  linear_error: (field) => field
}

export const errorFunctionsUnits: Record<string, SqlErrorFunction> = {
  potential_error: logaritmicCapped300ErrorUnit,
  linear_error: (field) => field
}
