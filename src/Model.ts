import { Constructor } from 'ytil'
import ModelSerialization from './ModelSerializer'
import { Context, ModelSerialized } from './types'

export default abstract class Model {

  constructor(
    public readonly serialized: ModelSerialized,
  ) {}

  public copy() {
    return (this.constructor as any).deserialize(this.serialized)
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

  public modify<M extends Model>(modifier: (raw: any) => any): M {
    const nextRaw = modifier(this.serialized)
    return Model.deserialize.call(this.constructor as Constructor<any>, nextRaw) as M
  }

}