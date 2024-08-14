import { AnyFunction } from 'ytil'
import Model from './Model'
import { Ref } from './Ref'

export interface PropertyInfo {
  field?:    string
  ref?:      string | ModelConstructor<Model>
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

export interface ModelConstructor<M extends Model> {
  new (...args: any[]): M

  deserialize<M extends Model>(raw: ModelSerialized, ...context: {} extends Context ? [] : [context: Context]): M
  serializePartial<M extends Model>(model: Partial<ModelAttributes<M>>): ModelSerialized
}
export type ModelSerialized = Record<string, any>

export type ModelAttributes<M extends Model> = Omit<{[K in keyof M as M[K] extends AnyFunction ? never : K]: M[K]}, '$serialized'>
export type ModelData<M extends Model> = Omit<ModelAttributes<M>, 'id' | 'createdAt' | 'updatedAt'>

export interface Context {}

export type RefResolver<M extends Model> = (ref: Ref<M>, context: Context) => M | null
export type RefExtractor<M extends Model> = (model: string | ModelConstructor<M>, raw: any, context: Context) => IDOf<M> | null

// Gracious ID extractor - if unknown, defaults to `any` instead of `never`.
export type IDOf<M extends Model> = M extends {id: infer ID} ? ID : any