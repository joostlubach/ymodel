import Model from '../Model'
import ModelSerialization from '../ModelSerializer'
import { ModelConstructor } from '../types'

export function ref<M extends Model>(model: ModelConstructor<M> | string, field?: string): PropertyDecorator {
  return (target: any, key: string | symbol): any => {
    const serialization = ModelSerialization.for(target)
    serialization.modify(key as string, prop => ({
      ...prop,
      field: field ?? prop.field,
      ref:   model,
    }))

    return {enumerable: true, writable: true}
  }
}