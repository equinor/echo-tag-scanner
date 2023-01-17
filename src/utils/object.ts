import cloneDeep from 'lodash.clonedeep';

/**
 * Performs a deep clone of an object or array-like.
 */
export function objectClone<T>(target: T): T {
  if ('structuredClone' in globalThis) {
    return structuredClone<T>(target);
  } else {
    // Fallback to lodash.cloneDeep.
    return cloneDeep(target);
  }
}
