import { Entity } from '../Entity'
import ModelSerialization from '../EntitySerializer'
import { EntityClass } from '../types'

export function ref<E extends Entity>(entity: (() => EntityClass<E>) | string, options: RefOptions = {}): PropertyDecorator {
  const {field, ...rest} = options

  return (target: any, key: string | symbol): void => {
    const serialization = ModelSerialization.for(target)
    serialization.modify(key as string, info => {
      if (field != null) {
        info.fields = [field]
      }
      info.ref = {
        entity,
        ...rest,
      }
    })
  }
}

export interface RefOptions {
  field?:   string
  idField?: string
}