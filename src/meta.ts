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

export function entityMeta<E extends Entity>(arg: E | EntityClass<E>, context: Context): ModelMeta {
  const EntityConstructor = arg instanceof Entity ? arg.constructor as EntityClass<E> : arg
  const input = metas.get(EntityConstructor) as ModelMetaInput<E>
  if (input == null) {
    throw new Error(`No meta assigned to entity ${EntityConstructor.name}`)
  } 

  const meta: Record<string, any> = {}
  for (const entry of objectEntries(input)) {
    const key = entry[0] as any
    const inp = entry[1] as any

    const value = isFunction(inp) ? inp(arg === EntityConstructor ? null : arg, context) : inp
    meta[key] = value
  }

  return meta as ModelMeta
}

export function modelName<E extends Entity>(entity: E | EntityClass<E>, context: Context): string {
  const EntityConstructor = entity instanceof Entity ? entity.constructor as EntityClass<E> : entity
  return entityMeta(entity, context)?.name ?? EntityConstructor.name
}