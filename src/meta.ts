import { ModelConstructor, ModelMeta } from './types'

const metas: Map<ModelConstructor<any>, ModelMeta> = new Map()

export function assignMeta(target: ModelConstructor<any>, meta: ModelMeta) {
  metas.set(target, {
    ...metas.get(target),
    ...meta,
  })
}

export function getModelMeta(target: ModelConstructor<any>): ModelMeta | null {
  return metas.get(target) ?? null
}