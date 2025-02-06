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

export function modelMeta<M extends Model>(model: M | ModelConstructor<M>): ModelMeta | null {
  const ModelClass = model instanceof Model ? model.constructor as ModelConstructor<M> : model
  const input = metas.get(ModelClass) as ModelMetaInput<M>
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

export function modelName<M extends Model>(model: M | ModelConstructor<M>): string {
  const ModelClass = model instanceof Model ? model.constructor as ModelConstructor<M> : model
  return modelMeta(model)?.name ?? ModelClass.name
}