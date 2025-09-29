import { Model } from '../Model'
import { assignMeta } from '../meta'
import { ModelConstructor, ModelMetaInput } from '../types'

export function meta<E extends Model>(meta: ModelMetaInput<E>) {
  return (target: ModelConstructor<E>) => {
    assignMeta(target, meta)
  }
}