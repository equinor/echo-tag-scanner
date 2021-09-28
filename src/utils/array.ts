/**
 * Removes an indice by index from an array.
 * If immutable flag is provided, it will take a copy, remove and return.
 */
function removeFromArray<T>(
  target: Array<T>,
  deleteIndex: number,
  immutable?: boolean
): Array<T> | void {
  if (immutable) {
    return removeAndFilter([...target]);
  } else {
    removeAndFilter();
  }

  function removeAndFilter(targetClone?: Array<T>) {
    if (Reflect.deleteProperty(targetClone || target, deleteIndex)) {
      return (targetClone || target).filter((t) => Boolean(t));
    } else {
      console.warn(
        'Could not remove indice, returning unaltered array. Maybe propertyKey is invalid or array is write protected?'
      );
      return targetClone || target;
    }
  }
}

export { removeFromArray };
