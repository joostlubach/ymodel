import { AnyFunction } from 'ytil'
import Entity from './Entity'
import { Ref } from './Ref'

export interface PropertyInfo {
  fields?:   string[]
  ref?:      RefInfo<Entity>
  serialize: PropertySerialization[]
}

export interface RefInfo<E extends Entity> {
  model:    string | EntityClass<E>
  idField?: string
}

export const PropertyInfo: {
  empty: () => PropertyInfo
} = {
  empty: () => ({
    serialize: [],
  }),
}

export interface PropertySerialization {
  type:     any
  path?:    string
  options?: object
}

export interface PropertySerializer<T, S, O> {
  deserialize: (serialized: S, options: O) => T
  serialize:   (value: T, options: O) => S
}

export interface EntityClass<E extends Entity> {
  new (...args: any[]): E

  deserialize<E extends Entity>(raw: ModelSerialized, ...context: {} extends Context ? [] : [context: Context]): E
  serializePartial<E extends Entity>(model: Partial<EntityAttributes<E>>): ModelSerialized
}
export type ModelSerialized = Record<string, any>

export type EntityAttributes<E extends Entity> = Omit<{[K in keyof E as E[K] extends AnyFunction ? never : K]: E[K]}, '$serialized'>
export type EntityData<E extends Entity> = Omit<EntityAttributes<E>, 'id' | 'created_at' | 'updated_at'>

export interface Context {}
export interface ModelMeta {
  name: string
}

export type ModelMetaInput<E extends Entity> = {
  [K in keyof ModelMeta]: ModelMeta[K] | ((item: E | null, context: Context) => ModelMeta[K])
}

export type RefResolver<E extends Entity> = (ref: Ref<E>, context: Context) => E | null
export type RefExtractor<E extends Entity> = (prop: string, propInfo: PropertyInfo, refInfo: RefInfo<E>, serialized: ModelSerialized, context: Context) => IDOf<E> | null

// Gracious ID extractor - if unknown, defaults to `any` instead of `never`.
export type IDOf<E extends Entity> = E extends {id: infer ID} ? ID : any