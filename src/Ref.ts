import Entity from './Entity'
import { Context, IDOf, RefExtractor, RefInfo, RefResolver } from './types'

export class Ref<E extends Entity> {

  constructor(
    public readonly info: RefInfo<E>,
    public readonly id: IDOf<E>,
    private readonly context: Context
  ) {}

  public get(): E | null {
    for (const resolver of resolvers) {
      const model = resolver(this, this.context)
      if (model != null) return model
    }

    return null
  }

}

const resolvers = new Set<RefResolver<any>>
const extractors = new Set<RefExtractor<any>>

export function refResolver<E extends Entity>(resolver: RefResolver<E>) {
  resolvers.add(resolver)
  return () => { resolvers.delete(resolver) }
}

export function refExtractor<E extends Entity>(extractor: RefExtractor<E>) {
  extractors.add(extractor)
  return () => { extractors.delete(extractor) }
}

export function getRefExtractors() {
  return Array.from(extractors)
}