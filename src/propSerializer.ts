import { propSerializers } from './registry'
import { PropertySerializer } from './types'

export function propSerializer<T, S>(type: Constructor<T>, serializer: PropertySerializer<T, S>) {
  propSerializers.set(type, serializer)
}