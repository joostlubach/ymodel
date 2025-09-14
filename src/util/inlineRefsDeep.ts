import { isArray } from 'lodash'
import { objectEntries, sparse } from 'ytil'
import { Ref } from '../Ref'

export function inlineRefsDeep(entity: object) {
  for (const [key, value] of objectEntries<any>(entity)) {
    if (value instanceof Ref) {
      (entity as any)[key] = inlineRefsDeep(value.get())
    } else if (isArray(value) && value.every(it => it instanceof Ref)) {
      const items = sparse(value.map(ref => ref.get()))
      items.forEach(inlineRefsDeep)
      ;(entity as any)[key] = items
    }
  }
}