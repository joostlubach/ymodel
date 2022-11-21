export interface PropertyInfo {
  field?:    string
  serialize: PropertySerialization[]
}

export const PropertyInfo: {
  empty: () => PropertyInfo
} = {
  empty: () => ({
    serialize: [],
  }),
}

export interface PropertySerialization {
  type:  any
  path?: string
}

export interface PropertySerializer<T, S> {
  serialize:   (serialized: S) => T
  deserialize: (value: T) => S
}

export type ModelSerialized = Record<string, any>