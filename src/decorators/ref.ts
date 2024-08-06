import Model from '../Model'
import ModelSerialization from '../ModelSerializer'
import { ModelConstructor } from '../types'

export function ref<M extends Model>(model: ModelConstructor<M> | string, field?: string): PropertyDecorator {
  return (target: any, key: string | symbol): any => {
    const serialization = ModelSerialization.for(target)
    serialization.modify(key as string, info => {
      info.ref = model
      if (field != null) {
        info.field = field
      }
    })

    return {enumerable: true, writable: true}
  }
}