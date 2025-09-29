import ModelSerialization from '../ModelSerializer'

export function field(...fields: string[]): PropertyDecorator {
  return (target: any, key: string | symbol): any => {
    const serialization = ModelSerialization.for(target)
    serialization.modify(key as string, prop => {
      prop.fields = fields
    })
  }
}