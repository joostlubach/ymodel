import { AnyFunction } from 'ytil'
import { Model } from './Model'
import { Ref } from './Ref'

export interface PropertyInfo {
  fields?:   string[]
  ref?:      RefInfo<Model>
  serialize: PropertySerialization[]
}

export interface RefInfo<E extends Model> {
  model:    (() => ModelConstructor<E>) | string
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

export interface ModelConstructor<E extends Model> {
  new (...args: any[]): E

  deserialize<E extends Model>(raw: ModelSerialized, ...context: {} extends Context ? [] : [context: Context]): E
  serializePartial<E extends Model>(model: Partial<ModelAttributes<E>>): ModelSerialized
}
export type ModelSerialized = Record<string, any>

export type ModelAttributes<E extends Model> = Omit<{[K in keyof E as E[K] extends AnyFunction ? never : K]: E[K]}, '$serialized'>
export type ModelData<E extends Model> = Omit<ModelAttributes<E>, 'id' | 'created_at' | 'updated_at'>

export interface Context {}
export interface ModelMeta {
  name: string
}

export type ModelMetaInput<E extends Model> = {
  [K in keyof ModelMeta]: ModelMeta[K] | ((item: E | null, context: Context) => ModelMeta[K])
}

export type RefResolver<E extends Model> = (ref: Ref<E>, context: Context) => E | null
export type RefExtractor<E extends Model> = (prop: string, propInfo: PropertyInfo, refInfo: RefInfo<E>, serialized: ModelSerialized, context: Context) => Ref<E> | undefined

// Gracious ID extractor - if unknown, defaults to `any` instead of `never`.
export type IDOf<E extends Model> = E extends {id: infer ID} ? ID : any