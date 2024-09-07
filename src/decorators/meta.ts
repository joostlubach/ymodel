import { assignMeta } from '../meta'
import { ModelMeta } from '../types'

export function meta(meta: ModelMeta): ClassDecorator {
  return (target: any) => {
    assignMeta(target, meta)
  }
}