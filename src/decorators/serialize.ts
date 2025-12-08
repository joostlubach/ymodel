import ModelSerialization from '../ModelSerializer'

export function serialize(type: Function, options: SerializerDecoratorOptions = {}) {
  return (target: undefined, context: ClassFieldDecoratorContext) => {
    if (context.kind !== 'field' && context.kind !== 'accessor') {
      throw new Error('@serialize() can only be applied to fields or accessors')
    }

    const key = context.name as string
    context.addInitializer(function () {
      ModelSerialization.for(this).modify(key, info => {
        const {path, ...rest} = options
        info.serialize.push({type, path, options: rest})
      })
    })
  }
}

export interface SerializerDecoratorOptions {
  path?: string

  // Additional options for the serializer.
  [key: string]: any
}