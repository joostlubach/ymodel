export function resolveConstructor(arg: any) {
  if (typeof arg === 'function' && arg.prototype != null) {
    return arg
  }
  if (typeof arg === 'object' && arg.constructor != null) {
    return arg.constructor
  }

  throw new Error(`Invalid Serializer target: ${arg}`)
}

export function resolveSuperCtor(ctor: Constructor<any>) {
  const superProto = ctor.prototype.__proto__
  if (superProto == null) { return null }

  return superProto.constructor
}