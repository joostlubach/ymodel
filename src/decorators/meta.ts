import { Model } from '../Model'
import { assignMeta } from '../meta'
import { ModelConstructor, ModelMetaInput } from '../types'

export function meta<E extends Model>(metaInput: ModelMetaInput<E>) {
  return (target: ModelConstructor<E>): void => {
    assignMeta(target, metaInput)
  }
}