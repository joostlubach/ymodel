import { camelCase, isObject } from 'lodash'
import { modifyObject } from 'ytil'
import Model from './Model'
import { modelSerializers, propSerializers } from './registry'
import { ModelSerialized, PropertyInfo } from './types'
import { resolveConstructor, resolveSuperCtor } from './util'

export default class ModelSerializer {

  constructor(
    public ctor: Constructor<Model>,
  ) {}

  private propertyInfos: Record<string, PropertyInfo> = {}

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

  public propInfo(prop: string): PropertyInfo {
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

  public modify(prop: string, modifier: (prop: PropertyInfo) => void) {
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

  public deserializeInto(model: Model, serialized: ModelSerialized) {
    for (const [prop, value] of Object.entries(serialized)) {
      const existing = Object.getOwnPropertyDescriptor(model, prop)
      Object.defineProperty(model, prop, {
        value:        this.deserializeProp(prop, value),
        writable:     existing?.writable ?? true,
        configurable: false,
      })
    }
  }

  public serializePartial(model: Partial<Model>) {
    const serialized: ModelSerialized = {}
    for (const [prop, value] of Object.entries(model)) {
      serialized[prop] = this.serializeProp(prop, value)
    }

    return serialized
  }

  public deserializeProp(prop: string, value: any) {
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

    return value
  }

  public serializeProp(prop: string, value: any) {
    const info = this.propInfo(prop)

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

    return value
  }

}
