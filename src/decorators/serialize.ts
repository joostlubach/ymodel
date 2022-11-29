import ModelSerialization from '../ModelSerializer'

export function serialize<T>(type: Constructor<T>, options: SerializerDecoratorOptions = {}): PropertyDecorator {
  return (target, key) => {
    if (typeof key !== 'string') { return }

    ModelSerialization.for(target).modify(key, info => {
      info.serialize.push({type, ...options})
    })
  }
}

export interface SerializerDecoratorOptions {
  path?: string
}