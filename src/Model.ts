import { Constructor } from 'ytil'
import ModelSerialization from './ModelSerializer'
import { Context, ModelSerialized } from './types'

export default abstract class Model {

  constructor(
    public readonly serialized: ModelSerialized,
  ) {}

  public copy(context: Context) {
    return (this.constructor as any).deserialize(this.serialized, context)
  }

  //------
  // Serialization

  public static deserialize<M extends Model>(this: Constructor<M>, raw: ModelSerialized, ...context: {} extends Context ? [] : [context: Context]): M {
    const model = new (this as any)(raw) as M
    model.deserialize((context as any[])[0] ?? {})
    return model
  }

  public static serializePartial<M extends Model>(this: Constructor<M>, model: Partial<M>): ModelSerialized {
    const serialization = ModelSerialization.for(this)
    return serialization.serializePartial(model)
  }

  protected deserialize(context: Context) {
    const serialization = ModelSerialization.for(this)

    const serialized = this.beforeDeserialize(this.serialized)
    serialization.deserializeInto(this, serialized, context)
    this.afterDeserialize()
  }

  protected beforeDeserialize(serialized: ModelSerialized) {
    return serialized
  }

  protected afterDeserialize() {}

  public update(updates: Record<string, any>, context: Context) {
    return (this.constructor as any).deserialize({
      ...this.serialized,
      ...updates,
    }, context)
  }

}