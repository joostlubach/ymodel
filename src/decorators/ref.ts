import { Model } from '../Model'
import ModelSerialization from '../ModelSerializer'
import { ModelConstructor } from '../types'

export function ref<E extends Model>(model: (() => ModelConstructor<E>) | string, options: RefOptions = {}) {
  const {field, ...rest} = options

  return (target: undefined, context: ClassFieldDecoratorContext): void => {
    if (context.kind !== 'field' && context.kind !== 'accessor') {
      throw new Error('@ref() can only be applied to fields or accessors')
    }

    const key = context.name as string
    context.addInitializer(function() {
      const serialization = ModelSerialization.for(this as object)
      serialization.modify(key, info => {
        if (field != null) {
          info.fields = [field]
        }
        info.ref = {
          model,
          ...rest,
        }
      })
    })
  }
}

export interface RefOptions {
  field?:   string
  idField?: string
}