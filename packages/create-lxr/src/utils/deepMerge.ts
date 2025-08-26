const isObject = (val: unknown): boolean => val !== null && typeof val === 'object'
const mergeArrayWithDedupe = (a: any, b: any): any => Array.from(new Set([...a, ...b]))

/**
 * Recursively merge the content of the new object to the existing one
 * @param {object} target the existing object
 * @param {object} obj the new object
 */
function deepMerge(target: any, obj: any): any {
  for (const key of Object.keys(obj)) {
    const oldVal = target[key]
    const newVal = obj[key]

    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      target[key] = mergeArrayWithDedupe(oldVal, newVal)
    }
    else if (isObject(oldVal) && isObject(newVal)) {
      target[key] = deepMerge(oldVal, newVal)
    }
    else {
      target[key] = newVal
    }
  }

  return target
}

export default deepMerge
