/**
 * Returns the current orientation of the device.
 */
export function getOrientation(): 'portrait' | 'landscape' {
  // We default to portrait if the height and width are equal.
  if (globalThis.innerHeight >= globalThis.innerWidth) return 'portrait';
  else return 'landscape';
}
