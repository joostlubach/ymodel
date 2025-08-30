import { isObject } from 'lodash'
import { Constructor, isFunction, modifyObject, monad, sparse } from 'ytil'
import Entity from './Entity'
import { getRefExtractors, Ref } from './Ref'
import { modelSerializers, propSerializers } from './registry'
import { Context, EntitySerialized, PropertyInfo, RefInfo } from './types'
import { resolveConstructor, resolveSuperCtor } from './util'

export default class ModelSerializer {

  constructor(
    public Entity: Constructor<Entity>,
  ) {}

  private propertyInfos: Record<string | symbol, PropertyInfo> = {}

  public static for(arg: any) {
    const ctor = resolveConstructor(arg)
    const serialization = modelSerializers.get(ctor)
    if (serialization != null) { return serialization }

    const newSerialization = new ModelSerializer(ctor)
    modelSerializers.set(ctor, newSerialization)
    return newSerialization
  }

  public get super(): ModelSerializer | null {
    const superCtor = resolveSuperCtor(this.Entity)
    if (superCtor == null) { return null }

    return ModelSerializer.for(superCtor)
  }

  public propInfo(prop: string | symbol, forWriting: boolean = false): PropertyInfo {
    if (prop in this.propertyInfos) {
      return this.propertyInfos[prop]
    }
    
    if (!forWriting) {
      // Fall back onto super serializers.
      const info = this.super?.propInfo(prop) ?? PropertyInfo.empty()
      this.propertyInfos[prop] = info
      return info
    } else {
      // Create an info object for the property here.
      this.propertyInfos[prop] = PropertyInfo.empty()
      return this.propertyInfos[prop]
    }
  }

  //------
  // Property modification

  public modify(prop: string | symbol, modifier: (prop: PropertyInfo) => void) {
    const info = this.propInfo(prop, true)
    modifier(info)
  }

  //------
  // Serialization

  public deserializeInto(entity: Entity, serialized: EntitySerialized, context: Context) {
    for (const [prop, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(entity))) {
      if (prop === '$serialized') { continue }
      if (descriptor.enumerable !== true) { continue }
      if (isFunction(descriptor.value)) { continue }

      Object.defineProperty(entity, prop, {
        ...descriptor,
        value:        this.deserializeProp(prop, serialized, context),
        configurable: false,
      })
    }
  }

  public serializePartial(entity: Partial<Entity>) {
    const serialized: EntitySerialized = {}
    for (const prop of Object.getOwnPropertyNames(entity)) {
      const info = Object.getOwnPropertyDescriptor(entity, prop)
      if (info?.enumerable !== true) { continue }

      const value = (entity as any)[prop]
      this.serializePropInto(serialized, prop, value)
    }

    return serialized
  }

  public deserializeProp(prop: string, serialized: EntitySerialized, context: Context) {
    const info = this.propInfo(prop)

    if (info.ref != null) {
      return this.deserializeRef(prop, info, info.ref, serialized, context)
    } else {
      return this.deserializePropValue(prop, info, serialized)
    }
  }

  private deserializePropValue(prop: string, info: PropertyInfo, serialized: EntitySerialized) {
    const fields = sparse(info.fields ?? [prop])
    let value = fields.reduce<any>((value, field) => {
      return value === undefined ? serialized[field] : value
    }, undefined)

    for (const {type, path, options = {}} of info.serialize) {
      const serializer = propSerializers.get(type)
      if (serializer != null) {
        value = modifyObject(value, path ?? '', value => (
          value == null ? null : monad.map(value, val => serializer.deserialize(val, options))
        ))
      } else {
        const typeName = isObject(type) ? (type as any)?.name ?? type : type
        console.warn(`Prop [${this.Entity.name}.${prop}]: no serializer found for type \`${typeName}\``)
      }
    }
    
    return value
  }

  private deserializeRef(prop: string, propInfo: PropertyInfo, refInfo: RefInfo<Entity>, serialized: EntitySerialized, context: Context) {
    const extractors = getRefExtractors()

    for (const extractor of extractors) {
      const idOrRef = extractor(prop, propInfo, refInfo, serialized, context)
      if (idOrRef === undefined) { continue }
      
      return monad.map(idOrRef, id => id == null ? null : new Ref(refInfo, id, context))
    }

    throw new Error(`Prop [${this.Entity.name}.${prop}]: no ref extractor found`)
  }

  public serializePropInto(serialized: EntitySerialized, prop: string, value: any) {
    const info = this.propInfo(prop)
    const destProp = sparse(info.fields ?? [prop]).shift()!

    if (info.ref != null) {
      value = monad.map(value, it => isObject(it) && 'id' in it ? it.id : it)
    }

    for (const {type, path, options = {}} of info.serialize) {
      const serializer = propSerializers.get(type)
      if (serializer != null) {
        value = modifyObject(value, path ?? '', value => (
          value == null ? null : monad.map(value, val => serializer.serialize(val, options))
        ))
      } else {
        const typeName = isObject(type) ? (type as any)?.name ?? type : type
        console.warn(`Prop [${this.Entity.name}.${prop}]: no serializer found for type \`${typeName}\``)
      }
    }

    serialized[destProp] = value
  }

}
