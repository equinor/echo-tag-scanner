interface ETSStorage extends Storage {
  storageKeys: Set<string>;
  /** Writes a new key value pair to storage.
   * If successfully written, returns the key-value pair, otherwise it returns undefined.
   */
  write: (target: string, value: string) => Record<string, string> | undefined;

  /** Reads the key and returns the value. All falsey values, including an empty string is returned as undefined. */
  read: (target: string) => string | undefined;

  /** Removes the key value pair from storage and returns the deleted value. */
  remove: (target: string) => string | undefined;
}

const etsStorage: ETSStorage = Object.create(globalThis.localStorage);

etsStorage.storageKeys = new Set([`ets-zoom-tutorial-dismissed`]);

etsStorage.write = (target: string, value: string) => {
  if (etsStorage.storageKeys.has(target)) {
    globalThis.localStorage.setItem(target, value);
    return { key: target, value: value };
  } else {
    console.warn(
      'The specified key ' + target + ' was not found in the approved key list.'
    );
    return undefined;
  }
};

etsStorage.read = (target: string) => {
  const value = globalThis.localStorage.getItem(target);
  if (typeof value === 'string' && value !== '') return value;
  else return undefined;
};

etsStorage.remove = (target: string) => {
  const removed = etsStorage.read(target);
  globalThis.localStorage.removeItem(target);
  return removed;
};

etsStorage.toString = () => {
  let toString: string = '';
  etsStorage.storageKeys.forEach((key) => {
    toString += `${key}: ${etsStorage.read(key)} ; `;
  });
  return toString.slice(0, toString.length - 2).trimEnd();
};

globalThis.etsStore = etsStorage;

export { etsStorage };
