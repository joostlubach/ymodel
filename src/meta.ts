import { isFunction, objectEntries } from 'ytil'
import Model from './Model'
import { ModelConstructor, ModelMeta, ModelMetaInput } from './types'

const metas: Map<ModelConstructor<any>, ModelMetaInput<any>> = new Map()

export function assignMeta(target: ModelConstructor<any>, meta: ModelMetaInput<any>) {
  metas.set(target, {
    ...metas.get(target),
    ...meta,
  })
}

export function getModelMeta<M extends Model>(model: M): ModelMeta | null {
  const input = metas.get(model.constructor as ModelConstructor<M>) as ModelMetaInput<M>
  if (input == null) { return null }

  const meta: Record<string, any> = {}
  for (const entry of objectEntries(input)) {
    const key = entry[0] as any
    const inp = entry[1] as any

    const value = isFunction(inp) ? inp(model) : inp
    meta[key] = value
  }

  return meta as ModelMeta
}