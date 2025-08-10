import { isFunction, objectEntries } from 'ytil'
import Entity from './Entity'
import { Context, EntityClass, ModelMeta, ModelMetaInput } from './types'

const metas: Map<EntityClass<any>, ModelMetaInput<any>> = new Map()

export function assignMeta(target: EntityClass<any>, meta: ModelMetaInput<any>) {
  metas.set(target, {
    ...metas.get(target),
    ...meta,
  })
}

export function modelMeta<E extends Entity>(arg: M | EntityClass<E>, context: Context): ModelMeta {
  const ModelClass = arg instanceof Entity ? arg.constructor as EntityClass<E> : arg
  const input = metas.get(ModelClass) as ModelMetaInput<E>
  if (input == null) {
    throw new Error(`No meta assigned to model ${ModelClass.name}`)
  } 

  const meta: Record<string, any> = {}
  for (const entry of objectEntries(input)) {
    const key = entry[0] as any
    const inp = entry[1] as any

    const value = isFunction(inp) ? inp(arg === ModelClass ? null : arg, context) : inp
    meta[key] = value
  }

  return meta as ModelMeta
}

export function modelName<E extends Entity>(model: M | EntityClass<E>, context: Context): string {
  const ModelClass = model instanceof Entity ? model.constructor as EntityClass<E> : model
  return modelMeta(model, context)?.name ?? ModelClass.name
}