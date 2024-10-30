import Model from '../Model'
import { assignMeta } from '../meta'
import { ModelConstructor, ModelMetaInput } from '../types'

export function meta<M extends Model>(meta: ModelMetaInput<M>) {
  return (target: ModelConstructor<M>) => {
    assignMeta(target, meta)
  }
}