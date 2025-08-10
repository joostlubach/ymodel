import { Constructor } from 'ytil'
import Entity from './Entity'
import ModelSerializer from './EntitySerializer'
import { PropertySerializer } from './types'

export const modelSerializers = new WeakMap<Constructor<Entity>, ModelSerializer>()
export const propSerializers = new WeakMap<any, PropertySerializer<any, any, any>>()