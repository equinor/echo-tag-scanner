import { useRef } from 'react';
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

  const debugOutput = useRef<HTMLOutputElement>(null);

  console.group('caches');
  console.info('event cache', eventCache.current);
  console.info('previous pinchy', prevPinchDiff.current);
  console.groupEnd();

  function mountEventHandlers() {
    console.info('mounting all the shit');
    // These refs are already null checked.
    gestureAreaRef.current!.onpointerdown = onPointerDown;
    gestureAreaRef.current!.onpointermove = onPointerMove;
    gestureAreaRef.current!.onpointerup = onPointerUp;

    // Following event handlers will reuse onpointerup.
    gestureAreaRef.current!.onpointercancel = onPointerUp;
    gestureAreaRef.current!.onpointerout = onPointerUp;
    gestureAreaRef.current!.onpointerleave = onPointerUp;
  }

  /**
   * Event for pointer down/touchdown. Will record user gestures to a cache for use in move event.
   * @param event
   */
  function onPointerDown(event: PointerEvent): void {
    console.info('pointer down, pointerId is: ', event.pointerId);
    if (Array.isArray(eventCache.current)) {
      // Record the event to the cache. In a pinch zoom context, this will happen twice.
      eventCache.current.push(event);
      console.info(eventCache.current[0]);
    }
  }

  /**
   *
   * @param event
   */
  function onPointerMove(event: PointerEvent): void {
    if (gestureAreaRef.current && gestureAreaRef.current instanceof HTMLDivElement) {
      // Find the matching onPointerDown event in the cache and reassign it as onPointerMove.
      // Using imperative for loop because a functional loop does not allow early termination.
      for (let i = 0; i < eventCache.current.length; i++) {
        if (event.pointerId === eventCache.current[i]?.pointerId) {
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
          console.info('a pinch zoom has been detected, user is zooming in', currentPinchDiff);
          // Handle zoom here
          gestureAreaRef.current.style.border = 'solid';
          console.log('%c⧭', 'color: #733d00', debugOutput.current);

          if (debugOutput.current) {
            const test = document.getElementById('diff');
            console.log('%c⧭', 'color: #e50000', test);

            if (test) {
              test.innerHTML = '' + currentPinchDiff;
            }
          }
        }

        if (currentPinchDiff < prevPinchDiff.current) {
          console.info('a pinch zoom has been detected, user is zooming out', currentPinchDiff);
          // Handle zoom here
          gestureAreaRef.current.style.border = 'dashed';
          console.log('%c⧭', 'color: #733d00', debugOutput.current);

          if (debugOutput.current) {
            const test = document.getElementById('diff');
            console.log('%c⧭', 'color: #e50000', test);
            if (test) {
              test.innerHTML = '' + currentPinchDiff;
            }
          }
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
    console.info('pointer up ,id', event.pointerId);
    console.info('event cache: ', eventCache.current);

    if (gestureAreaRef.current && gestureAreaRef.current instanceof HTMLDivElement) {
      gestureAreaRef.current.style.border = 'initial';

      for (let i = 0; i < eventCache.current.length; i++) {
        if (eventCache.current[i]?.pointerId === event.pointerId) {
          console.info('clearing event cache');
          eventCache.current.splice(i, 1);
          break;
        }
      }

      // The user did not do multitouch, reset.
      if (eventCache.current.length < 2) {
        console.info('The user did not do multitouch, resetting pinchy diff');
        prevPinchDiff.current = -1;
      }
    }
  }

  // Mount the gesture area after DOM is ready
  if (gestureAreaRef && gestureAreaRef.current != undefined) {
    mountEventHandlers();
  }

  return (
    <>
      <output ref={debugOutput} className={styles.debugOutput}>
        <fieldset>
          <p>
            Pointer1 ID: <mark id="p1-id">{eventCache.current[0]?.pointerId ?? 'not found'}</mark>{' '}
            <br />
            Pointer1 ClientX: <mark>{eventCache.current[0]?.clientX ?? 'not found'}</mark>
          </p>
        </fieldset>

        <fieldset>
          <p>
            Pointer2 ID: <mark>{eventCache.current[1]?.pointerId ?? 'not found'}</mark>
            <br />
            Pointer2 ClientX: <mark>{eventCache.current[1]?.clientX ?? 'not found'}</mark>
          </p>
        </fieldset>
        <fieldset>
          <p>
            Pointer distance: <mark id="diff">{prevPinchDiff.current}</mark>
          </p>
        </fieldset>
      </output>
      <div className={styles.gestureArea} ref={gestureAreaRef} />
    </>
  );
};

export { GestureHandler };
