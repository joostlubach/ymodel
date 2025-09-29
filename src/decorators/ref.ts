import { Model } from '../Model'
import ModelSerialization from '../ModelSerializer'
import { ModelConstructor } from '../types'

export function ref<E extends Model>(model: (() => ModelConstructor<E>) | string, options: RefOptions = {}): PropertyDecorator {
  const {field, ...rest} = options

  return (target: any, key: string | symbol): void => {
    const serialization = ModelSerialization.for(target)
    serialization.modify(key as string, info => {
      if (field != null) {
        info.fields = [field]
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