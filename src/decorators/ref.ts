import Model from '../Model'
import ModelSerialization from '../ModelSerializer'
import { ModelConstructor } from '../types'

export function ref<M extends Model>(model: ModelConstructor<M> | string, options: RefOptions = {}): PropertyDecorator {
  const {field, ...rest} = options

  return (target: any, key: string | symbol): any => {
    const serialization = ModelSerialization.for(target)
    serialization.modify(key as string, info => {
      if (field != null) {
        info.field = field
      }
      info.ref = {
        model,
        ...rest,
      }
    })
  }
}

export interface RefOptions {
  field?:   string
  idField?: string
}