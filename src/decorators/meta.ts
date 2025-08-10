import Entity from '../Entity'
import { assignMeta } from '../meta'
import { EntityClass, ModelMetaInput } from '../types'

export function meta<E extends Entity>(meta: ModelMetaInput<E>) {
  return (target: EntityClass<E>) => {
    assignMeta(target, meta)
  }
}