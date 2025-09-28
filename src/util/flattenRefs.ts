import { isArray } from 'lodash'
import { objectEntries, sparse } from 'ytil'
import { Ref } from '../Ref'

export function flattenRefs<O extends object>(entity: O): object {
  const clone = Object.create(entity.constructor.prototype)
  Object.assign(clone, {constructor: entity.constructor})

  for (const [key, value] of objectEntries(entity)) {
    if (value instanceof Ref) {
      clone[key] = flattenRefs(value.get())
    } else if (isArray(value) && value.every(it => it instanceof Ref)) {
      const items = sparse(value.map(ref => ref.get())).map(flattenRefs)
      clone[key] = items
    } else {
      clone[key] = value
    }
  }

  return clone
}