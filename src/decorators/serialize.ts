import ModelSerialization from '../ModelSerializer'

export function serialize(type: Function, options: SerializerDecoratorOptions = {}): PropertyDecorator {
  return (target, key) => {
    ModelSerialization.for(target).modify(key, info => {
      const {path, ...rest} = options
      info.serialize.push({type, path, options: rest})
    })
  }
}

export interface SerializerDecoratorOptions {
  path?: string

  // Additional options for the serializer.
  [key: string]: any
}