import { isArray, isObject } from 'lodash'
import { Constructor, modifyObject, monad, sparse } from 'ytil'
import Model from './Model'
import { getRefExtractors, Ref } from './Ref'
import { modelSerializers, propSerializers } from './registry'
import { Context, ModelSerialized, PropertyInfo, RefInfo } from './types'
import { resolveConstructor, resolveSuperCtor } from './util'

export default class ModelSerializer {

  constructor(
    public Model: Constructor<Model>,
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
    const superCtor = resolveSuperCtor(this.Model)
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

  public deserializeInto(model: Model, serialized: ModelSerialized, context: Context) {
    for (const [prop, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(model))) {
      if (prop === '$serialized') { continue }

      Object.defineProperty(model, prop, {
        ...descriptor,
        value:        this.deserializeProp(prop, serialized, context),
        configurable: false,
      })
    }
  }

  public serializePartial(model: Partial<Model>) {
    const serialized: ModelSerialized = {}
    for (const prop of Object.getOwnPropertyNames(model)) {
      const info = Object.getOwnPropertyDescriptor(model, prop)
      if (info?.enumerable !== true) { continue }

      const value = (model as any)[prop]
      this.serializePropInto(serialized, prop, value)
    }

    return serialized
  }

  public deserializeProp(prop: string, serialized: ModelSerialized, context: Context) {
    const info = this.propInfo(prop)

    if (info.ref != null) {
      return this.deserializeRef(prop, info, info.ref, serialized, context)
    } else {
      return this.deserializePropValue(prop, info, serialized)
    }
  }

  private deserializePropValue(prop: string, info: PropertyInfo, serialized: ModelSerialized) {
    const fields = sparse(info.fields ?? [prop])
    let value = fields.reduce<any>((value, field) => {
      return value === undefined ? serialized[field] : value
    }, undefined)

    for (const {type, path, options = {}} of info.serialize) {
      const serializer = propSerializers.get(type)
      if (serializer != null) {
        value = modifyObject(value, path ?? '', value => (
          value == null ? null : serializer.deserialize(value, options)
        ))
      } else {
        const typeName = isObject(type) ? (type as any)?.name ?? type : type
        console.warn(`Prop [${prop}]: no serializer found for type \`${typeName}\``)
      }
    }
    
    return value
  }

  private deserializeRef(prop: string, propInfo: PropertyInfo, refInfo: RefInfo<Model>, serialized: ModelSerialized, context: Context) {
    const extractors = getRefExtractors()

    for (const extractor of extractors) {
      const idOrRef = extractor(prop, propInfo, refInfo, serialized, context)
      if (idOrRef === undefined) { continue }
      
      return monad.map(idOrRef, id => new Ref(refInfo, id, context))
    }
  
    const fields = sparse(propInfo.fields ?? [prop])
    const value = fields.reduce<any>((value, field) => {
      return value === undefined ? serialized[field] : value
    }, undefined)
    return isArray(value) ? [] : null
  }

  public serializePropInto(serialized: ModelSerialized, prop: string, value: any) {
    const info = this.propInfo(prop)
    const destProp = sparse(info.fields ?? [prop]).shift()!

    if (info.ref != null) {
      value = monad.map(value, it => isObject(it) && 'id' in it ? it.id : it)
    }

    for (const {type, path, options = {}} of info.serialize) {
      const serializer = propSerializers.get(type)
      if (serializer != null) {
        value = modifyObject(value, path ?? '', value => (
          value == null ? null : serializer.serialize(value, options)
        ))
      } else {
        const typeName = isObject(type) ? (type as any)?.name ?? type : type
        console.warn(`Prop [${prop}]: no serializer found for type \`${typeName}\``)
      }
    }

    serialized[destProp] = value
  }

}
