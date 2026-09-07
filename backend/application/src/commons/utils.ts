export const removeUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined)
  ) as Partial<T>
}

export const toArray = <T>(value: T | T[] | undefined): T[] | undefined => {
    return value === undefined
        ? undefined
        : Array.isArray(value)
            ? value
            : [value];
}

export const toNumberArray = <T>(value: T | T[] | undefined): number[] | undefined => {
    return toArray(value)?.map(Number);
}

export const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
}

export type GeoJsonGeometry = Record<string, unknown>