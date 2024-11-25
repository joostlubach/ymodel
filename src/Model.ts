import { DateTime } from 'luxon'
import { ModelConstructor } from 'ymodel'
import { Constructor } from 'ytil'
import ModelSerialization from './ModelSerializer'
import { Context, ModelSerialized } from './types'

export default abstract class Model {

  constructor(
    private readonly $serialized: ModelSerialized,
  ) {
    Object.defineProperty(this, '$serialized', {
      enumerable:   false,
      configurable: false,
      writable:     false,
    })
  }

  public static build<M extends Model>(this: ModelConstructor<M>, data: ModelSerialized, ...context: {} extends Context ? [] : [context: Context]): M {
    return (this as unknown as ModelConstructor<M>).deserialize({
      id: null,

      ...data,

      updated_at: DateTime.local(),
      created_at: DateTime.local(),
    }, ...context)
  }

  public copy(...context: {} extends Context ? [] : [context: Context]) {
    return (this.constructor as any).deserialize(this.$serialized, ...context)
  }

  //------
  // Serialization

  public static deserialize<M extends Model>(this: Constructor<M>, raw: ModelSerialized, ...context: {} extends Context ? [] : [context: Context]): M {
    const model = new (this as any)(raw) as M
    model.deserialize((context as any[])[0] ?? {})
    return model
  }

  public serialize(): ModelSerialized {
    const serialization = ModelSerialization.for(this)
    return serialization.serializePartial(this)
  }

  public static serializePartial<M extends Model>(this: Constructor<M>, model: Partial<M>): ModelSerialized {
    const serialization = ModelSerialization.for(this)
    return serialization.serializePartial(model)
  }

  protected deserialize(context: Context) {
    const serialization = ModelSerialization.for(this)

    const serialized = this.beforeDeserialize(this.$serialized)
    serialization.deserializeInto(this, serialized, context)
    this.afterDeserialize()
  }

  protected beforeDeserialize(serialized: ModelSerialized) {
    return serialized
  }

  protected afterDeserialize() {}

  public modify(updates: Record<string, any>, context: Context): this {
    return (this.constructor as any).deserialize({
      ...this.$serialized,
      ...updates,
    }, context)
  }

}