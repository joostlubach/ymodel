import ModelSerialization from '../ModelSerializer'

export function serialize(type: Function, options: SerializerDecoratorOptions = {}): PropertyDecorator {
  return (target, key) => {
    ModelSerialization.for(target).modify(key, info => {
      info.serialize.push({type, ...options})
    })
  }
}

export interface SerializerDecoratorOptions {
  path?: string
}