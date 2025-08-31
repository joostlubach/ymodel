import { isFunction, objectEntries } from 'ytil'
import Entity from './Entity'
import { Context, EntityClass, EntityMeta, EntityMetaInput } from './types'

const metas: Map<EntityClass<any>, EntityMetaInput<any>> = new Map()

export function assignMeta(target: EntityClass<any>, meta: EntityMetaInput<any>) {
  metas.set(target, {
    ...metas.get(target),
    ...meta,
  })
}

export function entityMeta<E extends Entity>(arg: E | EntityClass<E>, context: Context): EntityMeta {
  const EntityConstructor = arg instanceof Entity ? arg.constructor as EntityClass<E> : arg
  const input = metas.get(EntityConstructor) as EntityMetaInput<E>
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

  return meta as EntityMeta
}

export function modelName<E extends Entity>(entity: E | EntityClass<E>, context: Context): string {
  const EntityConstructor = entity instanceof Entity ? entity.constructor as EntityClass<E> : entity
  return entityMeta(entity, context)?.name ?? EntityConstructor.name
}