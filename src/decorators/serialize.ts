import ModelSerialization from '../ModelSerializer'

export function serialize<T, S>(type: Constructor<T>, options: SerializerDecoratorOptions<T, S>): PropertyDecorator {
  return (target, key) => {
    if (typeof key !== 'string') { return }

    ModelSerialization.for(target).modify(key, info => {
      info.serialize.push({type, ...options})
    })
  }
}

export interface SerializerDecoratorOptions<T, S> {
  path?: string
}