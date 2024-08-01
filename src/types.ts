import Model from './Model'

export interface PropertyInfo {
  field?:    string
  ref?:      [ModelConstructor<any>, string]
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
  deserialize: (serialized: S) => T
  serialize:   (value: T) => S
}

export type ModelConstructor<M extends Model> = new (...args: any[]) => M
export type ModelSerialized = Record<string, any>