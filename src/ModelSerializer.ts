import { camelCase, isArray, isObject } from 'lodash'
import { Constructor, modifyObject } from 'ytil'
import Model from './Model'
import { extractRef, Ref } from './Ref'
import { modelSerializers, propSerializers } from './registry'
import { Context, ModelSerialized, PropertyInfo } from './types'
import { resolveConstructor, resolveSuperCtor } from './util'

export default class ModelSerializer {

  constructor(
    public ctor: Constructor<Model>,
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
    const superCtor = resolveSuperCtor(this.ctor)
    if (superCtor == null) { return null }

    return ModelSerializer.for(superCtor)
  }

  public propInfo(prop: string | symbol): PropertyInfo {
    if (prop in this.propertyInfos) {
      return this.propertyInfos[prop]
    } else {
      const info = this.super?.propInfo(prop) ?? PropertyInfo.empty()
      this.propertyInfos[prop] = info
      return info
    }
  }

  //------
  // Property modification

  public modify(prop: string | symbol, modifier: (prop: PropertyInfo) => void) {
    const info = this.propInfo(prop)
    modifier(info)
  }

  //------
  // Field names

  public propertyName(field: string) {
    for (const [prop, info] of Object.entries(this.propertyInfos)) {
      if (info.field === field) {
        return prop
      }
    }

    return camelCase(field)
  }

  //------
  // Serialization

  public deserializeInto(model: Model, serialized: ModelSerialized, context: Context) {
    for (const [prop, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(model))) {
      const field = this.propInfo(prop).field ?? prop
      const value = serialized[field]

      Object.defineProperty(model, prop, {
        ...descriptor,
        value:        this.deserializeProp(prop, value, context),
        configurable: false,
      })
    }
  }

  public serializePartial(model: Partial<Model>) {
    const serialized: ModelSerialized = {}
    for (const prop of Object.getOwnPropertyNames(model)) {
      const value = (model as any)[prop]
      this.serializePropInto(serialized, prop, value)
    }

    return serialized
  }

  public deserializeProp(prop: string, value: any, context: Context) {
    const info = this.propInfo(prop)

    for (const {type, path} of info.serialize) {
      const serializer = propSerializers.get(type)
      if (serializer != null) {
        value = modifyObject(value, path ?? '', value => (
          value == null ? null : serializer.deserialize(value)
        ))
      } else {
        const typeName = isObject(type) ? (type as any)?.name ?? type : type
        console.warn(`Prop [${prop}]: no serializer found for type \`${typeName}\``)
      }
    }

    const {ref} = info
    if (ref != null) {
      const key = extractRef(ref, value, context)
      if (isArray(key)) {
        value = key.map(key => new Ref(ref, key, context))
      } else if (key != null) {
        value = new Ref(ref, key, context)
      } else {
        value = null
      }
    }

    return value
  }

  public serializePropInto(serialized: ModelSerialized, prop: string, value: any) {
    const info = this.propInfo(prop)
    const destProp = info.field ?? prop

    console.log("SERIALIZE", prop, info, destProp, value)

    for (const {type, path} of info.serialize) {
      const serializer = propSerializers.get(type)
      if (serializer != null) {
        value = modifyObject(value, path ?? '', value => (
          value == null ? null : serializer.serialize(value)
        ))
      } else {
        const typeName = isObject(type) ? (type as any)?.name ?? type : type
        console.warn(`Prop [${prop}]: no serializer found for type \`${typeName}\``)
      }
    }

    serialized[destProp] = value
  }

}
