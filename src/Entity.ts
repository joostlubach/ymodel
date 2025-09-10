import { DateTime } from 'luxon'
import { EntityClass } from 'ymodel'
import { Constructor } from 'ytil'
import ModelSerialization from './EntitySerializer'
import { Context, EntitySerialized } from './types'

export default abstract class Entity {

  constructor(serialized: EntitySerialized) {
    Object.defineProperty(this, '$serialized', {
      value:        serialized,
      enumerable:   false,
      configurable: false,
      writable:     false,
    })
  }

  public readonly $serialized!: EntitySerialized

  public static build<E extends Entity>(this: EntityClass<E>, data: EntitySerialized, ...context: {} extends Context ? [] : [context: Context]): E {
    return (this as unknown as EntityClass<E>).deserialize({
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

  public static deserialize<E extends Entity>(this: Constructor<E>, raw: EntitySerialized, ...context: {} extends Context ? [] : [context: Context]): E {
    const entity = new (this as any)(raw) as E
    entity.deserialize((context as any[])[0] ?? {})
    return entity
  }

  public serialize(): EntitySerialized {
    const serialization = ModelSerialization.for(this)
    return serialization.serializePartial(this)
  }

  public static serializePartial<E extends Entity>(this: Constructor<E>, entity: Partial<E>): EntitySerialized {
    const serialization = ModelSerialization.for(this)
    return serialization.serializePartial(entity)
  }

  protected deserialize(context: Context) {
    const serialization = ModelSerialization.for(this)

    const serialized = this.beforeDeserialize(this.$serialized)
    serialization.deserializeInto(this, serialized, context)
    this.afterDeserialize()
  }

  protected beforeDeserialize(serialized: EntitySerialized) {
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