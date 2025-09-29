import { isFunction, objectEntries } from 'ytil'
import { Model } from './Model'
import { Context, ModelConstructor, ModelMeta, ModelMetaInput } from './types'

const metas: Map<ModelConstructor<any>, ModelMetaInput<any>> = new Map()

export function assignMeta(target: ModelConstructor<any>, meta: ModelMetaInput<any>) {
  metas.set(target, {
    ...metas.get(target),
    ...meta,
  })
}

export function modelMeta<E extends Model>(arg: E | ModelConstructor<E>, context: Context): ModelMeta {
  const ModelConstructor = arg instanceof Model ? arg.constructor as ModelConstructor<E> : arg
  const input = metas.get(ModelConstructor) as ModelMetaInput<E>
  if (input == null) {
    throw new Error(`No meta assigned to model ${ModelConstructor.name}`)
  } 

  const meta: Record<string, any> = {}
  for (const entry of objectEntries(input)) {
    const key = entry[0] as any
    const inp = entry[1] as any

    const value = isFunction(inp) ? inp(arg === ModelConstructor ? null : arg, context) : inp
    meta[key] = value
  }

  return meta as ModelMeta
}

export function modelName<E extends Model>(model: E | ModelConstructor<E>, context: Context): string {
  const ModelConstructor = model instanceof Model ? model.constructor as ModelConstructor<E> : model
  return modelMeta(model, context)?.name ?? ModelConstructor.name
}