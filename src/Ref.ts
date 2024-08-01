import Model from './Model'
import { Context, ModelConstructor, RefResolver } from './types'

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


export function refResolver<M extends Model>(resolver: RefResolver<M>) {
  resolvers.add(resolver)
  return () => { resolvers.delete(resolver) }
}