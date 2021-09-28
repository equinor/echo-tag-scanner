import { useRef } from 'react';
import { removeFromArray } from '@utils';
import styles from './styles.less';

const GestureHandler = (): JSX.Element => {
  // Ref the gesture area;
  const gestureAreaRef = useRef<HTMLDivElement>(null);

  // Used to preserve touch events.
  const eventCache = useRef<Array<PointerEvent>>([]);

  /**
   * Stores the previous pixel distance between two pointer events,
   * ie how far apart the fingers are in a pinch motion.
   */
  const prevPinchDiff = useRef<number>(-1);

  function mountEventHandlers() {
    if (gestureAreaRef.current != null) {
      gestureAreaRef.current.onpointerdown = onPointerDown;
      gestureAreaRef.current.onpointermove = onPointerMove;
      gestureAreaRef.current.onpointerup = onPointerUp;

      // Following event handlers will reuse onpointerup.
      gestureAreaRef.current.onpointercancel = onPointerUp;
      gestureAreaRef.current.onpointerout = onPointerUp;
      gestureAreaRef.current.onpointerleave = onPointerUp;
    }
  }

  /**
   * Event for pointer down/touchdown. Will record user gestures to a cache for use in move event.
   * @param event
   */
  function onPointerDown(event: PointerEvent): void {
    if (Array.isArray(eventCache.current) && eventCache.current.length === 0) {
      // Record the event to the cache. In a pinch zoom context, this will happen twice.
      eventCache.current.push(event);
      console.info('pointer down, pointerId is: ', event.pointerId);
    }
  }

  /**
   *
   * @param event
   */
  function onPointerMove(event: PointerEvent): void {
    if (gestureAreaRef.current && gestureAreaRef.current instanceof HTMLDivElement) {
      console.info('pointer moving, pointerId is: ', event.pointerId);

      // Find the matching onPointerDown event in the cache and reassign it as onPointerMove.
      // Using imperative for loop because a functional loop does not allow early termination.
      for (let i = 0; i < eventCache.current.length; i++) {
        if (event.pointerId === eventCache.current[i].pointerId) {
          eventCache.current[i] = event;
          break;
        }
      }

      /**
       * Measures the distance between two point/touch events in absolute values.
       * If the event cache does not contain exactly two pointer/touch events, it returns 0.
       */
      const currentPinchDiff = (function getPointerDistance() {
        if (eventCache.current.length === 2) {
          return Math.abs(eventCache.current[0].clientX - eventCache.current[1].clientX);
        } else {
          return 0;
        }
      })();

      // This covers the initial value of -1.
      if (prevPinchDiff.current > 0) {
        if (currentPinchDiff > prevPinchDiff.current) {
          console.info('a pinch zoom has been detected, user is zooming in');
          gestureAreaRef.current.style.border = 'solid';
        }

        if (currentPinchDiff < prevPinchDiff.current) {
          console.info('a pinch zoom has been detected, user is zooming out');
          gestureAreaRef.current.style.border = 'dashed';
        }
      } else {
        prevPinchDiff.current = currentPinchDiff;
      }
    }
  }

  /**
   * User has released their fat greasy fingers from the screen.
   * This will reset the event cache for next pinchy 🦀.
   * @param event
   */
  function onPointerUp(event: PointerEvent) {
    console.info('pointer up');
    if (gestureAreaRef.current && gestureAreaRef.current instanceof HTMLDivElement) {
      gestureAreaRef.current.style.border = 'initial';

      for (let i = 0; i < eventCache.current.length; i++) {
        if (eventCache.current[i].pointerId === event.pointerId) {
          removeFromArray(eventCache.current, i);
          break;
        }
      }

      // The user did not do multitouch, reset.
      if (eventCache.current.length < 2) {
        prevPinchDiff.current = -1;
      }
    }
  }

  if (gestureAreaRef.current == null) {
    mountEventHandlers();
  }

  return <div className={styles.gestureArea} ref={gestureAreaRef} />;
};

export { GestureHandler };
