import Model from '../Model'
import ModelSerialization from '../ModelSerializer'
import { ModelConstructor } from '../types'

export function ref<M extends Model>(model: ModelConstructor<M> | string, options: RefOptions = {}): PropertyDecorator {
  return (target: any, key: string | symbol): any => {
    const serialization = ModelSerialization.for(target)
    serialization.modify(key as string, info => {
      info.ref = {
        model,
        ...options,
      }
    })

    return {enumerable: true, writable: true}
  }
}

export interface RefOptions {
  instanceField?: string
  idField?:       string
}