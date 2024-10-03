import { AnyFunction } from 'ytil'
import Model from './Model'
import { Ref } from './Ref'

export interface PropertyInfo {
  fields?:   string[]
  ref?:      RefInfo<Model>
  serialize: PropertySerialization[]
}

export interface RefInfo<M extends Model> {
  model:    string | ModelConstructor<M>
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

export interface ModelConstructor<M extends Model> {
  new (...args: any[]): M

  deserialize<M extends Model>(raw: ModelSerialized, ...context: {} extends Context ? [] : [context: Context]): M
  serializePartial<M extends Model>(model: Partial<ModelAttributes<M>>): ModelSerialized
}
export type ModelSerialized = Record<string, any>

export type ModelAttributes<M extends Model> = Omit<{[K in keyof M as M[K] extends AnyFunction ? never : K]: M[K]}, '$serialized'>
export type ModelData<M extends Model> = Omit<ModelAttributes<M>, 'id' | 'created_at' | 'updated_at'>

export interface Context {}
export interface ModelMeta {}

export type RefResolver<M extends Model> = (ref: Ref<M>, context: Context) => M | null
export type RefExtractor<M extends Model> = (prop: string, propInfo: PropertyInfo, refInfo: RefInfo<M>, serialized: ModelSerialized, context: Context) => IDOf<M> | null

// Gracious ID extractor - if unknown, defaults to `any` instead of `never`.
export type IDOf<M extends Model> = M extends {id: infer ID} ? ID : any