import { logger } from './logger';

/**
 * Removes an indice by index from an array.
 * If immutable flag is provided, it will take a copy, remove and return.
 */
function removeFromArray<T>(
  target: T[],
  deleteIndex: number,
  immutable?: boolean
): T[] | undefined {
  if (immutable && Array.isArray(target)) {
    return removeAndFilter([...target]);
  } else {
    return removeAndFilter();
  }

  function removeAndFilter(targetClone?: T[]) {
    if (typeof (targetClone || target) === 'object') {
      if (Reflect.deleteProperty(targetClone || target, deleteIndex)) {
        return (targetClone || target).filter((t) => Boolean(t));
      } else {
        logger.log('Warning', () =>
          console.warn(
            'Could not remove indice, returning unaltered array. Maybe propertyKey is invalid or array is write protected?'
          )
        );
        return targetClone || target;
      }
    }
  }
}

export { removeFromArray };
