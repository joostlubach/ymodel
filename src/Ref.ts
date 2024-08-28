import Model from './Model'
import { Context, IDOf, RefExtractor, RefInfo, RefResolver } from './types'

export class Ref<M extends Model> {

  constructor(
    public readonly info: RefInfo<M>,
    public readonly id: IDOf<M>,
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
const extractors = new Set<RefExtractor<any>>

export function refResolver<M extends Model>(resolver: RefResolver<M>) {
  resolvers.add(resolver)
  return () => { resolvers.delete(resolver) }
}

export function refExtractor<M extends Model>(extractor: RefExtractor<M>) {
  extractors.add(extractor)
  return () => { extractors.delete(extractor) }
}

export function getRefExtractors() {
  return Array.from(extractors)
}