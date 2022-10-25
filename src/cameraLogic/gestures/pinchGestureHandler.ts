import { ZoomGestureHandler } from './gestureHandler';
/**
 * Handles pinch gestures which is used to pinch-zoom the viewfinder.
 */
class PinchGestureHandler extends ZoomGestureHandler {
  /** A short-lived list of pointer events. */
  private gestureEventCache: PointerEvent[] = [];

  /**
   * Stores the previous pixel distance between two pointer events,
   * ie how far apart the fingers are in a pinch motion.
   */
  private prevPinchDiff: number | undefined = undefined;

  /**
   * Event for pointer down/touchdown. Will record user gestures to a cache for use in move event.
   * @param event
   */
  public onPointerDown(event: PointerEvent): void {
    if (Array.isArray(this.gestureEventCache)) {
      // Record the event to the cache. In a pinch zoom context, this will happen twice.
      this.gestureEventCache.push(event);
    }
  }

  /**
   *
   * @param event
   */
  public onPointerMove(event: PointerEvent): void {
    // Find the matching onPointerDown event in the cache and reassign it as onPointerMove.
    for (let i = 0; i < this.gestureEventCache.length; i++) {
      if (event.pointerId === this.gestureEventCache[i]?.pointerId) {
        this.gestureEventCache[i] = event;
        break;
      }
    }

    /**
     * Measures the distance between two point/touch events in absolute values.
     * If the event cache does not contain exactly two pointer/touch events, it returns 0.
     */
    const currentPinchDiff = function getPointerDistance(
      this: PinchGestureHandler
    ) {
      if (this.gestureEventCache.length === 2) {
        return Math.abs(
          this.gestureEventCache[0].clientX - this.gestureEventCache[1].clientX
        );
      } else {
        return 0;
      }
    }.call(this);

    // This covers the initial value of undefined.
    if (this.prevPinchDiff != undefined) {
      if (currentPinchDiff > this.prevPinchDiff) {
        console.info(
          'a pinch zoom has been detected, user is zooming in',
          currentPinchDiff
        );
      }

      if (currentPinchDiff < this.prevPinchDiff) {
        console.info(
          'a pinch zoom has been detected, user is zooming out',
          currentPinchDiff
        );
      }
    } else {
      this.prevPinchDiff = currentPinchDiff;
    }
  }

  /**
   * User has released their fat greasy fingers from the screen.
   * This will reset the event cache for next pinchy 🦀.
   * @param event
   */
  public onPointerUp(event: PointerEvent) {
    for (let i = 0; i < this.gestureEventCache.length; i++) {
      if (this.gestureEventCache[i]?.pointerId === event.pointerId) {
        this.gestureEventCache.splice(i, 1);
        break;
      }
    }

    // The user did not do multitouch, reset.
    if (this.gestureEventCache.length < 2) {
      this.prevPinchDiff = -1;
    }
  }
}

export { PinchGestureHandler };
