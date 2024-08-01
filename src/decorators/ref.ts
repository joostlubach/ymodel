import Model from '../Model'
import ModelSerialization from '../ModelSerializer'
import { ModelConstructor } from '../types'

export function ref<M extends Model>(Model: ModelConstructor<M>, foreignKey: string): PropertyDecorator {
  return (target: any, key: string | symbol): any => {
    const serialization = ModelSerialization.for(target)
    serialization.modify(key as string, prop => ({
      ...prop,
      ref: [Model, foreignKey],
    }))

    return {enumerable: true, writable: true}
  }
}