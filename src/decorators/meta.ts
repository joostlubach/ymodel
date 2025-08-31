import Entity from '../Entity'
import { assignMeta } from '../meta'
import { EntityClass, EntityMetaInput } from '../types'

export function meta<E extends Entity>(meta: EntityMetaInput<E>) {
  return (target: EntityClass<E>) => {
    assignMeta(target, meta)
  }
}