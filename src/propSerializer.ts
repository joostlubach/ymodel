import { Constructor, EmptyObject } from 'ytil'
import { propSerializers } from './registry'
import { PropertySerializer } from './types'

export function propSerializer<T, S, O = EmptyObject>(type: Constructor<T>, serializer: PropertySerializer<T, S, O>): void
export function propSerializer<T, S, O = EmptyObject>(type: Function, serializer: PropertySerializer<T, S, O>): void
export function propSerializer<T, S, O = EmptyObject>(type: Function, serializer: PropertySerializer<T, S, O>) {
  propSerializers.set(type, serializer)
}