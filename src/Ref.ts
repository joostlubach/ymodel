import { isArray } from 'lodash'
import { sparse } from 'ytil'
import Model from './Model'
import { Context, ModelConstructor, RefExtractor, RefResolver } from './types'

export class Ref<M extends Model> {

  constructor(
    public readonly model: ModelConstructor<M> | string,
    public readonly key: any,
    private readonly context: Context
  ) {}

  public get(): M | null {
    for (const resolver of resolvers) {
      const model = resolver(this, this.context)
      if (model != null) return model
    }

    return null
  }

}

const resolvers = new Set<RefResolver<any>>
const extractors = new Set<RefExtractor>

export function refResolver<M extends Model>(resolver: RefResolver<M>) {
  resolvers.add(resolver)
  return () => { resolvers.delete(resolver) }
}

export function refExtractor(extractor: RefExtractor) {
  extractors.add(extractor)
  return () => { extractors.delete(extractor) }
}

export function extractRef(model: string | ModelConstructor<any>, raw: any, context: Context): Array<string | number> | string | number | null {
  for (const extractor of extractors) {
    if (isArray(raw)) {
      const ids = sparse(raw.map((r: any) => extractor(model, r, context)))
      if (ids.length > 0) {
        return ids
      }
    } else {
      const id = extractor(model, raw, context)
      if (id != null) { return id }
    }
  }

  return null
}