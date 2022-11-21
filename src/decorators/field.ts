import ModelSerialization from '../ModelSerializer'

export function field(name: string): PropertyDecorator {
  return (target: any, key: string | symbol): any => {
    const serialization = ModelSerialization.for(target)
    serialization.modify(key as string, prop => ({...prop, field: name}))

    return {enumerable: true, writable: true}
  }
}