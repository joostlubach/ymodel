import { Constructor } from 'ytil'
import Model from './Model'
import ModelSerializer from './ModelSerializer'
import { PropertySerializer } from './types'

export const modelSerializers = new WeakMap<Constructor<Model>, ModelSerializer>()
export const propSerializers = new WeakMap<any, PropertySerializer<any, any, any>>()