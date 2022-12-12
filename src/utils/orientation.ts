import { Camera, CoreCamera } from '@cameraLogic';
import { logger } from '@utils';

type OrientationHandlerMethods = 'DeviceOrientationAPI' | 'MatchMedia';
/**
 * Handles the orienation event changes.
 * Returns a stringified name of on of the methods or a null if unable to use any of the methods.
 */
export function defineOrientationChangeEvent(
  this: Camera
): OrientationHandlerMethods | null {
  // Use Screen Orientation API if available.
  if (screen.orientation.onchange) {
    screen.orientation.addEventListener(
      'change',
      handleOrientationChange.bind(this)
    );

    return 'DeviceOrientationAPI';
  }

  // Fallback to media query string change event.
  if (globalThis.matchMedia) {
    const mql = globalThis.matchMedia('(orientation: landscape)');
    mql.onchange = (event: MediaQueryListEvent) =>
      handleOrientationChange.call(this, event, mql);
    return 'MatchMedia';
  }

  logger.log('QA', () =>
    console.warn(
      `No method of altering the device orientation was found. The initial of ${this.currentOrientation} will always be used.`
    )
  );
  return null;

  function handleOrientationChange(
    this: CoreCamera,
    event: Event | MediaQueryListEvent,
    mql?: MediaQueryList
  ) {
    if (event instanceof MediaQueryListEvent && mql) {
      if (mql.matches) {
        this.currentOrientation = 'landscape';
      } else this.currentOrientation = 'portrait';
    } else {
      // Use fallback logic if Screen Orienation API is not supported.
      if (screen.orientation.type.includes('landscape')) {
        this.currentOrientation = 'landscape';
      } else this.currentOrientation = 'portrait';
    }

    return this.currentOrientation;
  }
}

/**
 * Returns the current orientation of the device.
 */
export function getOrientation(): 'portrait' | 'landscape' {
  // Use ScreenOrientation API if supported.
  if (globalThis.screen.orientation) {
    if (globalThis.globalThis.screen.orientation.type.includes('landscape'))
      return 'landscape';
    else return 'portrait';
  }

  // ScreenOrientationAPI not supported.
  if (globalThis.innerHeight >= globalThis.innerWidth) return 'portrait';
  else return 'landscape';
}
