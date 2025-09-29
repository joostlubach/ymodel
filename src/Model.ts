import { DateTime } from 'luxon'
import { Constructor } from 'ytil'
import ModelSerialization from './ModelSerializer'
import { Context, ModelConstructor, ModelSerialized } from './types'

export abstract class Model {

  constructor(serialized: ModelSerialized) {
    Object.defineProperty(this, '$serialized', {
      value:        serialized,
      enumerable:   false,
      configurable: false,
      writable:     false,
    })
  }

  public readonly $serialized!: ModelSerialized

  public static build<E extends Model>(this: ModelConstructor<E>, data: ModelSerialized, ...context: {} extends Context ? [] : [context: Context]): E {
    return (this as unknown as ModelConstructor<E>).deserialize({
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

  public static deserialize<E extends Model>(this: Constructor<E>, raw: ModelSerialized, ...context: {} extends Context ? [] : [context: Context]): E {
    const model = new (this as any)(raw) as E
    model.deserialize((context as any[])[0] ?? {})
    return model
  }

  public serialize(): ModelSerialized {
    const serialization = ModelSerialization.for(this)
    return serialization.serializePartial(this)
  }

  public static serializePartial<E extends Model>(this: Constructor<E>, model: Partial<E>): ModelSerialized {
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