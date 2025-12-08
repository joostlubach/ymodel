import ModelSerialization from '../ModelSerializer'

export function field(...fields: string[]) {
  return (target: undefined, context: ClassFieldDecoratorContext) => {
    if (context.kind !== 'field' && context.kind !== 'accessor') {
      throw new Error('@field() can only be applied to fields or accessors')
    }

    const key = context.name as string
    context.addInitializer(function () {
      const serialization = ModelSerialization.for(this)
      serialization.modify(key, prop => {
        prop.fields = fields
      })
    })
  }
}